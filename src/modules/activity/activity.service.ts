import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ACTIVITY_ORDER_TEMPLATE_KEY, COLLECTION_ORDER_COUNT } from 'src/common/contants/redis.contant';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindConditions, Repository, } from 'typeorm';
import { Collection } from '../collection/entities/collection.entity';
import { CreateActivityDto, ListActivityDto, UpdateActivityDto, UpdateAllActivityDto } from './dto/request-activity.dto';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
    @InjectRedis() private readonly redis: Redis,
  ) { }
  async create(createActivityDto: CreateActivityDto) {
    const activity = await this.activityRepository.save(createActivityDto);
    await this.redis.set(`${COLLECTION_ORDER_COUNT}:${activity.id}`, activity.supply)
    await this.redis.set(`${ACTIVITY_ORDER_TEMPLATE_KEY}:${activity.id}`, JSON.stringify(activity))
    return activity;
  }

  /* 新增或编辑 */
  async addOrUpdateAll(updateActivityDto: UpdateAllActivityDto) {
    return await this.activityRepository.save(updateActivityDto)
  }

  /* 分页查询 */
  async list(listActivityList: ListActivityDto, paginationDto: PaginationDto): Promise<PaginatedDto<Activity>> {
    let where: FindConditions<Activity> = {}
    let result: any;
    where = listActivityList;
    result = await this.activityRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: ['collections'],
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        // createTime: 1,
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* 获取推荐 */
  async recommendList(): Promise<PaginatedDto<Activity>> {
    let where: FindConditions<Activity> = {}
    let result: any;
    where = { recommend: '1' };
    result = await this.activityRepository.findAndCount({
      // select: ['id', 'coverImage', 'startTime', 'status', 'endTime', 'title', 'type', 'collections',],
      where,
      relations: ['collections', 'collections.author'],
      order: {
        type: 1,
      }
    })
    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.activityRepository.findOne(id, { relations: ['collections', 'collections.contract'], })
  }

  update(id: number, updateActivityDto: UpdateActivityDto) {
    return this.activityRepository.update(id, updateActivityDto)
  }

  deleteOne(id: number) {
    return this.activityRepository.delete(id)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.activityRepository.delete(noticeIdArr)
  }

  async addCollection(id: number, collectionId: number) {
    await this.activityRepository.createQueryBuilder()
      .relation(Activity, "collections")
      .of(id)
      .add(collectionId);
    const activity = await this.activityRepository.findOne(id);
    const collection = await this.collectionRepository.findOne(collectionId, { relations: ['author'] });
    if (!activity.authorName) {
      activity.authorName = collection.author.nickName
      activity.avatar = collection.author.avatar
    }
    activity.supply += collection.supply
    let updateDto = { authorName: activity.authorName, avatar: activity.avatar, supply: activity.supply }
    await this.activityRepository.update(id, updateDto)
    return activity
  }

  async deleteCollection(id: number, collectionId: number) {
    await this.activityRepository.createQueryBuilder()
      .relation(Activity, "collections")
      .of(id)
      .remove(collectionId);
    const activity = await this.activityRepository.findOne(id);
    const collection = await this.collectionRepository.findOne(collectionId, { relations: ['author'] });
    activity.supply -= collection.supply
    await this.activityRepository.update(id, { supply: activity.supply })
    return activity
  }
}
