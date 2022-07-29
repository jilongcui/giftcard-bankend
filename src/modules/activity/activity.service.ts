import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindConditions, Repository, } from 'typeorm';
import { CreateActivityDto, ListActivityDto, UpdateActivityDto, UpdateAllActivityDto } from './dto/request-activity.dto';
import { Activity } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
  ) { }
  async create(createActivityDto: CreateActivityDto) {
    return await this.activityRepository.save(createActivityDto);
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

  findOne(id: number) {
    return this.activityRepository.findOne(id, { relations: ['collections'], })
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
    return this.activityRepository.createQueryBuilder()
      .relation(Activity, "collections")
      .of(id)
      .add(collectionId);
  }

  async deleteCollection(id: number, collectionId: number) {
    return this.activityRepository.createQueryBuilder()
      .relation(Activity, "collections")
      .of(id)
      .remove(collectionId);
  }
}
