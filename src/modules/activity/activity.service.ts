import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ACTIVITY_ORDER_TEMPLATE_KEY, COLLECTION_ORDER_COUNT } from 'src/common/contants/redis.contant';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiException } from 'src/common/exceptions/api.exception';
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
    return activity;
  }

  /* 新增或编辑 */
  async addOrUpdateAll(updateActivityDto: UpdateActivityDto) {
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
        createTime: 'DESC'
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
        type: 'ASC',
        createTime: 'DESC'
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

  async start(id: number) {
    const activity = await this.activityRepository.findOne(id)
    if (activity.status === '1') {
      throw new ApiException('活动已开启');
    }
    const updateActivityDto = new UpdateActivityDto()
    updateActivityDto.status = '1' // start
    const result = await this.activityRepository.update(id, updateActivityDto)
    await this.redis.set(`${COLLECTION_ORDER_COUNT}:${activity.id}`, activity.supply)
    await this.redis.set(`${ACTIVITY_ORDER_TEMPLATE_KEY}:${activity.id}`, JSON.stringify(activity))
    return result
  }

  async sellout(id: number) {
    const activity = await this.activityRepository.findOne(id)
    if (activity.status === '2') {
      throw new ApiException('活动已售完');
    }
    const updateActivityDto = new UpdateActivityDto()
    updateActivityDto.status = '2' // sellout
    const result = await this.activityRepository.update(id, updateActivityDto)
    await this.redis.set(`${COLLECTION_ORDER_COUNT}:${activity.id}`, 0)
    return result
  }

  async finish(id: number) {
    const updateActivityDto = new UpdateActivityDto()
    updateActivityDto.status = '3' // finish
    return this.activityRepository.update(id, updateActivityDto)
  }


  async addCollection(id: number, collectionId: number) {
    return await this.activityRepository.createQueryBuilder()
      .relation(Activity, "collections")
      .of(id)
      .add(collectionId);
  }

  async deleteCollection(id: number, collectionId: number) {
    return await this.activityRepository.createQueryBuilder()
      .relation(Activity, "collections")
      .of(id)
      .remove(collectionId);
  }
}
