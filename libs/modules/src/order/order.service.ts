import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Inject, Injectable, Logger, ParseArrayPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { COLLECTION_ORDER_COUNT, ACTIVITY_ORDER_TEMPLATE_KEY, COLLECTION_ORDER_SUPPLY, ACTIVITY_START_TIME, ACTIVITY_PRESTART_TIME, ACTIVITY_USER_ORDER_KEY, ASSET_ORDER_KEY, MAGICBOX_ORDER_KEY } from '@app/common/contants/redis.contant';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Repository, FindOptionsWhere, EntityManager, getManager, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Activity } from '../activity/entities/activity.entity';
import { PreemptionWhitelist } from '../assistant/preemption/entities/preemptionWhitelist.entity';
import { Asset } from '../collection/entities/asset.entity';
import { CreateLv1OrderDto, CreateLv2OrderDto, CreateOrderDto, EnrollMemberOrderDto, ListMyOrderDto, ListOrderDto, ListRechargeOrderDto, ListUnpayOrderDto, RechargeOrderDto, UpdateOrderDto, UpdateOrderStatusDto } from './dto/request-order.dto';
import { Order } from './entities/order.entity';
import { ConfigService } from '@nestjs/config';
import { User } from '../system/user/entities/user.entity';
import { Magicbox } from '../magicbox/entities/magicbox.entity';
import { MemberInfo } from '../member/entities/member-info.entity';
import strRandom from 'string-random';

@Injectable()
export class OrderService {
  logger = new Logger(OrderService.name)
  platformAddress: string
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(MemberInfo) private readonly memberInfoRepository: Repository<MemberInfo>,
    @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
    @InjectRepository(PreemptionWhitelist) private readonly preemptionWhitelistRepository: Repository<PreemptionWhitelist>,
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.platformAddress = this.configService.get<string>('crichain.platformAddress')
  }
  async createLv1Order(createOrderDto: CreateLv1OrderDto, userId: number, userName: string) {
    // 开启事务
    // 判断当前剩余
    // 如果有剩余，那么就生成订单
    // 否则，就失败
    let activity: Activity
    let orderCount: any
    let unpayOrderKey: string;
    const orderType = '0'
    // const activityJson = await this.redis.get(`${ACTIVITY_ORDER_TEMPLATE_KEY}:${createOrderDto.activityId}`)
    // const jsonObject: any = JSON.parse(activityJson)
    // activity = <Activity>jsonObject;
    // if (!activityJson) {
    //   activity = await this.activityRepository.findOne(
    //     { where: { id: createOrderDto.activityId }, relations: { preemption: true } })
    //   if (!activity) {
    //     throw new ApiException('藏品活动不存在', 401)
    //   }
    //   await this.redis.set(`${ACTIVITY_ORDER_TEMPLATE_KEY}:${activity.id}`, JSON.stringify(activity))

    // }
    unpayOrderKey = ACTIVITY_USER_ORDER_KEY + ":" + createOrderDto.activityId + ":" + userId
    let startTime: string;
    // 首先读取订单缓存，如果还有未完成订单，那么就直接返回订单。
    const unpayOrder = await this.redis.get(unpayOrderKey)
    // this.logger.debug(unpayOrder)
    if (unpayOrder != null) {
      throw new ApiException('有未完成订单', 401)
    }
    // 没有缓存，开始创建订单
    // 如果时间大于开始时间，那么直接就开始了
    // 否则才会读取预售时间，然后再判断预售开始了没有。
    // 如果预售也开始了，那么就判单这个用户是否具有预售权限。
    const startTimeKey = ACTIVITY_START_TIME + ":" + createOrderDto.activityId;
    startTime = await this.redis.get(startTimeKey)
    const now = moment.now()
    if (now < parseInt(startTime)) {
      const preStartTimeKey = ACTIVITY_PRESTART_TIME + ":" + createOrderDto.activityId;
      startTime = await this.redis.get(preStartTimeKey)
      if (!startTime || now < parseInt(startTime)) {
        throw new ApiException('没开始')
      }
      // 可以预售
      // 判断用户预售权限
      const preemption = await this.preemptionWhitelistRepository.findOneBy({ userId: userId, activityId: createOrderDto.activityId })
      if (!preemption) {
        throw new ApiException('没有预售权限')
      }
    }

    const countKey = COLLECTION_ORDER_COUNT + ":" + createOrderDto.activityId;
    const count = Math.min(createOrderDto.count, 5); // 1～5
    orderCount = await this.redisAtomicDecr(countKey, count)
    if (orderCount < 0) {
      await this.redisAtomicIncr(countKey, count)
      throw new ApiException('创建失败')
    }

    // 一级市场活动创建订单
    return await this.orderRepository.manager.transaction(async manager => {
      const order = new Order();
      order.id = parseInt('1' + strRandom(8, {letters: false}))
      order.type = orderType;
      order.status = '1';
      order.userId = userId;
      order.userName = userName
      // 一级市场活动创建订单
      const activityJson = await this.redis.get(`${ACTIVITY_ORDER_TEMPLATE_KEY}:${createOrderDto.activityId}`)

      if (!activityJson) {
        throw new ApiException('藏品活动不存在', 401)
      } else {
        const jsonObject: any = JSON.parse(activityJson)
        activity = <Activity>jsonObject;
      }
      order.activityId = createOrderDto.activityId;
      order.assetType = activity.type
      order.count = count
      order.realPrice = activity.price
      order.totalPrice = activity.price * count;
      order.image = activity.coverImage;
      order.desc = activity.title;
      order.invalidTime = moment().add(5, 'minute').toDate()
      order.collections = activity.collections;

      // 5 分钟
      await this.redis.set(unpayOrderKey, order.id, 'EX', 60 * 5)
      await manager.save(order);

      return order;
    });
  }

  async createLv2Order(createOrderDto: CreateLv2OrderDto, userId: number, userName: string) {
    let unpayOrderKey: string;
    const orderType = '1'

    if (createOrderDto.assetType === '0')
      unpayOrderKey = ASSET_ORDER_KEY + ":" + (createOrderDto.assetId)
    else if (createOrderDto.assetType === '1')
      unpayOrderKey = MAGICBOX_ORDER_KEY + ":" + (createOrderDto.assetId)

    // 首先读取订单缓存，如果还有未完成订单，那么就直接返回订单。
    const unpayOrder = await this.redis.get(unpayOrderKey)
    if (unpayOrder != null) {
      throw new ApiException('无法创建订单', 401)
    }
    const order = new Order()
    order.id = parseInt('1' + strRandom(8, {letters: false}))
    order.type = orderType
    order.status = '1'
    order.userId = userId
    order.userName = userName
    order.assetId = createOrderDto.assetId
    order.assetType = createOrderDto.assetType
    order.count = 1
    order.invalidTime = moment().add(5, 'minute').toDate()

    return await this.orderRepository.manager.transaction(async manager => {
      if (createOrderDto.assetType === '0') { // 藏品
        let asset: Asset
        asset = await manager.findOne(Asset, { where: { id: order.assetId, status: '1' }, relations: ['collection'] })
        if (!asset)
          throw new ApiException('市场上未发现此藏品')
        order.realPrice = asset.price
        order.totalPrice = asset.price
        order.desc = asset.collection.name;
        order.image = asset.collection.images[0]
        await manager.save(order);
        await manager.update(Asset, { id: order.assetId }, { status: '2' }) // Asset is locked.

      } else if (createOrderDto.assetType === '1') {// 盲盒
        let magicbox: Magicbox
        magicbox = await manager.findOne(Magicbox, { where: { id: order.assetId, status: '1' }, relations: ['activity'] })
        if (!magicbox)
          throw new ApiException('市场上未发现此盲盒')
        order.realPrice = magicbox.price
        order.totalPrice = magicbox.price
        order.desc = magicbox.activity.title;
        order.image = magicbox.activity.coverImage
        await manager.save(order);
        await manager.update(Magicbox, { id: order.assetId }, { status: '2' }) // Asset is locked.
      }
      // 5 分钟
      await this.redis.set(unpayOrderKey, order.id, 'EX', 60 * 5)
      return order;
    });
  }

  async rechargeOrder(createOrderDto: RechargeOrderDto, userId: number, userName: string, avatar: string) {
    const orderType = '2'
    return await this.orderRepository.manager.transaction(async manager => {
      const order = new Order()
      order.id = parseInt('1' + strRandom(8, {letters: false}))
      order.type = orderType
      order.status = '1'
      order.userId = userId
      order.userName = userName
      order.realPrice = createOrderDto.realPrice
      order.totalPrice = createOrderDto.realPrice
      order.count = 1
      order.desc = '充值订单';
      order.image = avatar
      order.invalidTime = moment().add(10, 'minute').toDate()
      await manager.save(order);
      return order;
    });
  }

  /* 升级会员订单 */
  async enrollMemberOrder(createOrderDto: EnrollMemberOrderDto, userId: number, userName: string, avatar: string) {
    const orderType = '3' // 升级会员
    const memberInfo = await this.memberInfoRepository.findOneBy({id: createOrderDto.memberInfoId})
    return await this.orderRepository.manager.transaction(async manager => {
      const order = new Order()
      order.id = parseInt('1' + strRandom(8, {letters: false}))
      order.type = orderType
      order.status = '1'
      order.userId = userId
      order.userName = userName
      order.realPrice = memberInfo.price
      order.totalPrice = memberInfo.price
      order.assetId = memberInfo.id
      order.count = 1
      order.desc = '升级会员';
      order.image = avatar
      order.invalidTime = moment().add(10, 'minute').toDate()
      await manager.save(order);
      return order;
    });
  }

  /* 新增或编辑 */
  async addOrUpdateAll(createOrderDto: CreateOrderDto) {
    return await this.orderRepository.save(createOrderDto)
  }

  /* 分页查询 */
  async list(listOrderList: ListOrderDto, paginationDto: PaginationDto): Promise<PaginatedDto<Order>> {
    let where: FindOptionsWhere<Order> = {}
    let result: any;
    where = listOrderList

    result = await this.orderRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { activity: true, collections: true },
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* 我的订单查询 */
  async mylist(userId: number, listMyOrderDto: ListMyOrderDto, paginationDto: PaginationDto): Promise<PaginatedDto<Order>> {
    let where: FindOptionsWhere<ListOrderDto> = {}
    let result: any;
    where = {
      ...listMyOrderDto,
      userId,
    }
    if (listMyOrderDto.status === '1')
      where.invalidTime = MoreThanOrEqual(moment(moment.now()).toDate())

    result = await this.orderRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: ["activity", "collections"],
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* 分页查询 */
  async myUnpayList(userId: number, listUnpayDto: ListUnpayOrderDto, paginationDto: PaginationDto): Promise<PaginatedDto<Order>> {
    let where: FindOptionsWhere<Order> = {}
    let result: any;
    where =
    {
      ...listUnpayDto,
      userId: userId,
      status: '1',
      invalidTime: MoreThanOrEqual(moment(moment.now()).toDate())
    }
    result = await this.orderRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: ["activity", "collections"],
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* 充值 - 分页查询 */
  async myRechargeList(userId: number, listUnpayDto: ListRechargeOrderDto, paginationDto: PaginationDto): Promise<PaginatedDto<Order>> {
    let where: FindOptionsWhere<Order> = {}
    let result: any;
    where =
    {
      ...listUnpayDto,
      userId: userId,
      type: '2',
    }
    result = await this.orderRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      // relations: [],
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.orderRepository.findOne({ where: { id }, relations: { activity: true, collections: true, payment: true } })
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto)
  }

  updatePaymentStatus(id: number, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto)
  }

  deleteOne(id: number) {
    return this.orderRepository.delete(id)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.orderRepository.delete(noticeIdArr)
  }

  async cancel(id: number, userId: number) {
    let where: FindOptionsWhere<Order> = {}
    let result: any;
    let order = await this.orderRepository.findOneBy({ id: id })
    let unpayOrderKey: string;
    if (order.userId !== userId) {
      throw new ApiException("非本人订单")
    }
    // where =
    // {
    //   activityId: activityId ?? undefined,
    //   status: '1',
    //   invalidTime: LessThanOrEqual(moment(moment.now()).toDate())
    // }
    // 清理缓存
    if (order.type === '0') {
      unpayOrderKey = ACTIVITY_USER_ORDER_KEY + ":" + order.activityId + ":" + order.userId
      // this.logger.debug(`activityId: ${order.activityId}`)
      await this.orderRepository.manager.transaction(async manager => {
        // Set invalid status
        // where.activityId = order.activityId
        order.status = '0'
        // totalCount += order.count
        manager.save(order)
      })
      const countKey = COLLECTION_ORDER_COUNT + ":" + order.activityId;
      await this.redisAtomicDecr(countKey, order.count)
      await this.redis.del(unpayOrderKey)
    } else if (order.type === '1') {
      // this.logger.debug(`assetId: ${order.assetId}`)
      unpayOrderKey = ASSET_ORDER_KEY + ":" + (order.assetId || order.activityId)
      await this.orderRepository.manager.transaction(async manager => {
        // Set invalid status
        // where.assetId = order.assetId
        order.status = '0'
        // totalCount += order.count
        manager.save(order)
        await manager.update(Asset, { id: order.assetId }, { status: '1' }) // Unlocked.
      })
      await this.redis.del(unpayOrderKey)
    } else if (order.type === '2') {
      // this.logger.debug(`assetId: ${order.assetId}`)
      await this.orderRepository.manager.transaction(async manager => {
        // Set invalid status
        // where.assetId = order.assetId
        order.status = '0'
        // totalCount += order.count
        manager.save(order)
      })
    }
  }

  // /* 更新过期订单状态 */
  async syncInvalidOrder(activityId?: number) {
    let where: FindOptionsWhere<Order> = {}
    let result: any;
    where =
    {
      activityId: activityId ?? undefined,
      status: '1',
      invalidTime: LessThanOrEqual(moment(moment.now() + 1000 * 10).toDate())
    }
    let totalCount: number = 0;
    const order = await this.orderRepository.findOne({ where })
    if (!order) return
    // if (order.payment && order.payment.status !== '0') {
    //   return
    // }

    if (order.type === '0') {
      await this.orderRepository.manager.transaction("SERIALIZABLE", async manager => {
        const order = await this.orderRepository.findOne({ where },)
        if (order) {
          // Set invalid status
          // where.activityId = order.activityId
          // totalCount += order.count
          const result = await manager.update(Order, { id: order.id, status: '1' }, { status: '3' }) // 失效.
          if (result.affected > 0) {
            const countKey = COLLECTION_ORDER_COUNT + ":" + order.activityId;
            await this.redisAtomicIncr(countKey, order.count)
          }
        }
      })
    } else if (order.type === '1') {
      this.logger.debug(`assetId: ${order.assetId}`)
      await this.orderRepository.manager.transaction(async manager => {
        // Set invalid status
        // where.assetId = order.assetId
        order.status = '3'
        // totalCount += order.count
        await manager.save(order)
        await manager.update(Asset, { id: order.assetId }, { status: '1' }) // Unlocked.
      })
    } else if (order.type === '2') {
      await this.orderRepository.manager.transaction(async manager => {
        // Set invalid status
        // where.assetId = order.assetId
        order.status = '3'
        // totalCount += order.count
        await manager.save(order)
      })
    }

    return totalCount;
  }

  async redisAtomicDecr(countKey: string, count: number) {
    const watchError = await this.redis.watch(countKey)
    if (watchError !== 'OK') throw new ApiException(watchError)
    const [execResult] = await this.redis.multi().decrby(countKey, count).exec()
    if (execResult[0] !== null) {
      this.logger.debug('Redis Atomic Decr retry.')
      this.redisAtomicDecr(countKey, count)
    }
    return execResult[1] // result
  }

  async redisAtomicIncr(countKey: string, count: number) {
    const watchError = await this.redis.watch(countKey)
    if (watchError !== 'OK') throw new ApiException(watchError)
    const [execResult] = await this.redis.multi().incrby(countKey, count).exec()
    if (execResult[0] !== null) {
      this.logger.debug('Redis Atomic Incr retry.')
      this.redisAtomicIncr(countKey, count)
    }
    return execResult[1] // result
  }
}
