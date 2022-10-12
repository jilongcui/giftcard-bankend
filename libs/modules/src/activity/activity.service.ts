import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import { ACTIVITY_ORDER_TEMPLATE_KEY, ACTIVITY_PRESTART_TIME, ACTIVITY_START_TIME, COLLECTION_ORDER_COUNT, MAGICBOX_LIST_KEY, MAGICBOX_ORDER_COUNT } from '@app/common/contants/redis.contant';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { FindOptionsWhere, In, IsNull, Not, Repository, } from 'typeorm';
import { CreateActivityDto, ListActivityDto, UpdateActivityDto } from './dto/request-activity.dto';
import { Activity } from './entities/activity.entity';
import { Magicbox } from '../magicbox/entities/magicbox.entity';
import { AssetService } from '../collection/asset.service';
import { CreateAssetDto } from '../collection/dto/request-asset.dto';
import { SharedService } from '@app/shared';
import { MagicboxService } from '../magicbox/magicbox.service';
import { CreateMagicboxDto } from '../magicbox/dto/request-magicbox.dto';
import { Collection } from '../collection/entities/collection.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRedis() private readonly redis: Redis,
    private readonly assetService: AssetService,
    private readonly magicboxService: MagicboxService,
    private readonly sharedService: SharedService
  ) { }
  async create(createActivityDto: CreateActivityDto) {
    let ids = []
    createActivityDto.collections.map((collection: Collection) => {
      ids.push(collection.id)
    })

    const collections = await this.collectionRepository.find({
      where: { id: In(ids), type: createActivityDto.type, activityId: IsNull() },
      relations: { author: true }
    })
    if (collections.length !== createActivityDto.collections.length) {
      throw new ApiException("关联的藏品有误")
    }
    let supplyAmount = 0
    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i]
      supplyAmount += collection.supply
    }
    const collection = collections[0] // Primary collection.

    let activityDto = {
      ...createActivityDto,
      authorName: collection.author.nickName,
      avatar: collection.author.avatar,
      supply: supplyAmount
    }

    const activity = await this.activityRepository.save(activityDto);
    return activity;
  }

  async getRemainCount(activityId: string) {
    const key = COLLECTION_ORDER_COUNT + ':' + activityId
    const value = await this.cacheManager.get(key);
    if (value != undefined) return value;
    let valueStr = await this.redis.get(key)
    if (valueStr != null) {
      await this.cacheManager.set(key, valueStr, { ttl: 5 })
    }
    if (parseInt(valueStr) < 0)
      valueStr = '0'
    return valueStr;
  }

  /* 新增或编辑 */
  async addOrUpdateAll(updateActivityDto: UpdateActivityDto) {
    return await this.activityRepository.save(updateActivityDto)
  }

  /* 分页查询 */
  async list(listActivityList: ListActivityDto, paginationDto: PaginationDto): Promise<PaginatedDto<Activity>> {
    let where: FindOptionsWhere<Activity> = {}
    let result: any;

    where = {
      ...listActivityList,
      status: In(['0', '1', '2', '3'])
    }
    where.authorName = listActivityList.authorName;
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

  /* 分页查询 */
  async more(listActivityList: ListActivityDto, paginationDto: PaginationDto): Promise<PaginatedDto<Activity>> {
    let where: FindOptionsWhere<Activity> = {}
    let result: any;
    where = {
      ...listActivityList,
      status: In(['1', '2'])
    }
    // where = listActivityList
    where.authorName = listActivityList.authorName;
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
  async topList(): Promise<PaginatedDto<Activity>> {
    let where: FindOptionsWhere<Activity> = {}
    let result: any;
    where = { top: '1', status: In(['1', '2']) };
    result = await this.activityRepository.findAndCount({
      // select: ['id', 'coverImage', 'startTime', 'status', 'endTime', 'title', 'type', 'collections',],
      where,
      relations: ['collections', 'collections.author',],
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
    return this.activityRepository.findOne({
      where: { id },
      relations: {
        collections: {
          contract: true
        }
      },
    })
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
    const activity = await this.activityRepository.findOne(
      { where: { id }, relations: { collections: true, preemption: false } })
    if (activity.status === '1') {
      throw new ApiException('活动已开启');
    }
    const updateActivityDto = new UpdateActivityDto()
    updateActivityDto.status = '1' // start
    const result = await this.activityRepository.update(id, updateActivityDto)

    await this.redis.set(`${ACTIVITY_START_TIME}:${activity.id}`, activity.startTime.getUTCMilliseconds())
    if (activity.preemption)
      await this.redis.set(`${ACTIVITY_PRESTART_TIME}:${activity.id}`, activity.preemption.startTime.getUTCMilliseconds())
    await this.redis.set(`${ACTIVITY_ORDER_TEMPLATE_KEY}:${activity.id}`, JSON.stringify(activity))
    if (activity.type === '0') { // 藏品
      await this.redis.set(`${COLLECTION_ORDER_COUNT}:${activity.id}`, activity.supply - activity.current)
    }
    if (activity.type === '1') { // 盲盒
      await this.redis.set(`${COLLECTION_ORDER_COUNT}:${activity.id}`, activity.supply - activity.current)
      // 需要先初始化magicBox
      // 创建asset array
      let indexArray = []
      await Promise.all(activity.collections.map(async (collection) => {
        const collectionId = collection.id
        for (let i = 0; i < collection.supply; i++) {
          const index = i + 1
          let createAssetDto: CreateAssetDto = {
            price: activity.price,
            userId: 1,
            index: index,
            collectionId: collectionId
          }
          const asset = this.assetService.create(createAssetDto)
          await this.assetService.addOrUpdate(asset)
          indexArray.push({ assetId: asset.id, collectionId, index })
        }
      }))
      this.sharedService.shuffle(indexArray)

      // 把asset和magicbox关联起来
      indexArray.map(async ({ assetId, collectionId, index }) => {
        const createMagicboxDto: CreateMagicboxDto = {
          activityId: activity.id,
          assetId: assetId,
          collectionId: collectionId,
          index: index,
          userId: 1,
          price: activity.price
        }
        const magicbox = this.magicboxService.create(createMagicboxDto)
        await this.magicboxService.addOrUpdate(magicbox)

        // push magicbox id to redis cache
        await this.redis.rpush(`${MAGICBOX_LIST_KEY}:${activity.id}`, magicbox.id)
      })
    }
    return result
  }

  async sellout(id: number) {
    const activity = await this.activityRepository.findOneBy({ id })
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

  async setTop(id: number) {
    const updateActivityDto = new UpdateActivityDto()
    updateActivityDto.top = '1' // Set top
    return this.activityRepository.update(id, updateActivityDto)
  }

  async unTop(id: number) {
    const updateActivityDto = new UpdateActivityDto()
    updateActivityDto.top = '0' // Set untop
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
