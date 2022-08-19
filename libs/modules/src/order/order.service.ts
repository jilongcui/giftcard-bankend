import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Inject, Injectable, Logger, ParseArrayPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { COLLECTION_ORDER_COUNT, ACTIVITY_ORDER_TEMPLATE_KEY, COLLECTION_ORDER_SUPPLY, ACTIVITY_START_TIME, ACTIVITY_PRESTART_TIME, ACTIVITY_USER_ORDER_KEY, ASSET_ORDER_KEY } from '@app/common/contants/redis.contant';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Repository, FindOptionsWhere, EntityManager, getManager, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { Activity } from '../activity/entities/activity.entity';
import { PreemptionWhitelist } from '../assistant/preemption/entities/preemptionWhitelist.entity';
import { CreateAssetDto } from '../collection/dto/request-asset.dto';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { CreateOrderDto, ListMyOrderDto, ListOrderDto, ListUnpayOrderDto, UpdateOrderDto, UpdateOrderStatusDto } from './dto/request-order.dto';
import { Order } from './entities/order.entity';
import { ClientProxy } from '@nestjs/microservices';
import { MintADto } from '@app/chain';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  logger = new Logger(OrderService.name)
  platformAddress: string
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(PreemptionWhitelist) private readonly preemptionWhitelistRepository: Repository<PreemptionWhitelist>,
    @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
    @InjectRedis() private readonly redis: Redis,
    @Inject('CHAIN_SERVICE') private client: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.platformAddress = this.configService.get<string>('crichain.platformAddress')
  }
  async create(createOrderDto: CreateOrderDto, userId: number) {
    // 开启事务
    // 判断当前剩余
    // 如果有剩余，那么就生成订单
    // 否则，就失败
    let activity: Activity
    let orderCount: any
    let unpayOrderKey: string;

    if (createOrderDto.type === '0') { // 一级市场活动创建订单
      unpayOrderKey = ACTIVITY_USER_ORDER_KEY + ":" + createOrderDto.activityId + ":" + userId
      let startTime: string;
      // 首先读取订单缓存，如果还有未完成订单，那么就直接返回订单。
      const unpayOrder = await this.redis.get(unpayOrderKey)
      if (unpayOrder) {
        throw new ApiException('有未完成订单', 403)
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
      const [execError] = await this.redis.multi().decrby(countKey, createOrderDto.count).exec()
      orderCount = execError[1]
      if (orderCount < 0) {
        // await this.redis.unwatch()
        throw new ApiException('已售完')
      }
      // this.logger.log(execError[0])
      // this.logger.log(orderCount)
    } else {
      unpayOrderKey = ASSET_ORDER_KEY + ":" + (createOrderDto.assetId || createOrderDto.activityId)
      // 首先读取订单缓存，如果还有未完成订单，那么就直接返回订单。
      const unpayOrder = await this.redis.get(unpayOrderKey)
      if (unpayOrder) {
        throw new ApiException('无法创建订单', 401)
      }
    }
    return await this.orderRepository.manager.transaction(async manager => {
      const order = new Order();
      order.type = createOrderDto.type;
      order.status = '1';
      order.userId = userId;
      if (order.type == '0') { // 一级市场活动创建订单
        const activityJson = await this.redis.get(`${ACTIVITY_ORDER_TEMPLATE_KEY}:${createOrderDto.activityId}`)
        const jsonObject: any = JSON.parse(activityJson)
        activity = <Activity>jsonObject;
        order.activityId = createOrderDto.activityId;
        order.count = Math.min(createOrderDto.count, 5); // 1～10
        order.realPrice = activity.price * order.count;
        order.totalPrice = order.realPrice;
        order.image = activity.coverImage;
        order.desc = activity.title;
        order.invalidTime = moment().add(5, 'minute').toDate()
        order.collections = activity.collections;
      } else if (order.type === '1') { // 交易市场创建的订单
        order.assetId = createOrderDto.assetId || createOrderDto.activityId
        const asset = await this.assetRepository.findOne({ where: { id: order.assetId, status: '1' }, relations: ['collection'] })
        if (!asset)
          throw new ApiException('市场上未发现此藏品')
        order.realPrice = asset.price
        order.totalPrice = asset.price
        order.desc = asset.collection.name;
        order.image = asset.collection.images[0]
        order.invalidTime = moment().add(5, 'minute').toDate()
      }
      // 5 分钟
      await this.redis.set(unpayOrderKey, order.id, 'EX', 60 * 5)

      await manager.save(order);

      await manager.update(Asset, { id: order.assetId }, { status: '2' }) // Asset is locked.
      // orderCount--;
      // if (orderCount % 100 === 0) {
      //   activity.current = activity.current + 1;
      //   await manager.save(activity)
      // }
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

  findOne(id: number) {
    return this.orderRepository.findOne({ where: { id }, relations: { activity: true, collections: true } })
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto)
  }

  deleteOne(id: number) {
    return this.orderRepository.delete(id)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.orderRepository.delete(noticeIdArr)
  }

  async payWithBalance(id: number, userId: number, userName: string) {
    // 在transaction里只做和冲突相关的，和冲突不相关的要放在外面
    // transaction里很有可能会失败，保证失败时是可以回退的，
    const order = await this.orderRepository.findOne({ where: { id: id, status: '1', userId: userId } })
    if (order == null) {
      throw new ApiException('订单状态错误')
    }
    let asset: Asset

    if (order.type === '1') {
      asset = await this.assetRepository.findOne({ where: { id: order.assetId }, relations: { user: true } })
      if (asset.userId === userId)
        throw new ApiException("不能购买自己的资产")
    }

    await this.orderRepository.manager.transaction(async manager => {
      const result = await manager.decrement(Account, { user: { userId: userId }, usable: MoreThanOrEqual(order.realPrice) }, "usable", order.realPrice);
      // this.logger.log(JSON.stringify(result));
      if (!result.affected) {
        throw new ApiException('支付失败')
      }
      order.status = '2';
      // 把Order的状态改成2: 已支付
      await manager.update(Order, { id: order.id }, { status: '2' })

      if (order.type === '1') {
        await manager.increment(Account, { userId: asset.user.userId }, "usable", order.realPrice * 95 / 100)
        await manager.increment(Account, { userId: 1 }, "usable", order.realPrice * 5 / 100)
        await manager.update(Asset, { id: order.assetId }, { userId: userId, status: '0' })
      }

    })

    if (order.type === '0') { // 一级市场活动
      // Create assetes for user.
      const activity = await this.activityRepository.findOne({ where: { id: order.activityId }, relations: ['collections'] })
      // First we need get all collections of orders, but we only get one collection.
      if (!activity.collections || activity.collections.length <= 0) {
        return order;
      }
      let collection: Collection;
      if (activity.type === '1') {
        // 首发盲盒, 我们需要随机寻找一个。
        const index = Math.floor((Math.random() * activity.collections.length));
        collection = activity.collections[index]
      } else {
        // 其他类型，我们只需要取第一个
        collection = activity.collections[0];
      }
      // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
      await this.collectionRepository.manager.transaction(async manager => {
        await manager.increment(Collection, { id: collection.id }, "current", order.count);
      })
      let tokenId: number
      for (let i = 0; i < order.count; i++) {
        tokenId = this.randomTokenId()
        let createAssetDto = new CreateAssetDto()
        createAssetDto.price = order.realPrice
        createAssetDto.assetNo = tokenId
        createAssetDto.userId = userId
        createAssetDto.collectionId = collection.id

        await this.assetRepository.save(createAssetDto)
        // 记录交易记录
        await this.assetRecordRepository.save({
          type: '2', // Buy
          assetId: tokenId,
          price: order.realPrice,
          toId: userId,
          toName: userName
        })

        const pattern = { cmd: 'mintA' }
        const mintDto = new MintADto()
        mintDto.address = this.platformAddress
        mintDto.tokenId = tokenId.toString()
        mintDto.contractId = 8
        this.client.emit(pattern, mintDto)
        // this.logger.debug(await firstValueFrom(result))
      }


    } else if (order.type === '1') { // 二级市场资产交易
      // 把资产切换到新的用户就可以了
      await this.buyAsset(asset, userId, userName)
      // 还需要转移资产
    }
    // await manager.save(order);
    return order;
    // })
  }

  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }

  async buyAsset(asset: Asset, userId: number, userName: string) {

    const fromId = asset.user.userId
    const fromName = asset.user.userName

    await this.assetRecordRepository.save({
      type: '2', // Buy
      assetId: asset.id,
      price: asset.price,
      fromId: fromId,
      fromName: fromName,
      toId: userId,
      toName: userName
    })
  }

  /* 更新过期订单状态 */
  async syncInvalidOrder(activityId?: number) {
    let where: FindOptionsWhere<Order> = {}
    let result: any;
    where =
    {
      activityId: activityId ?? undefined,
      status: '1',
      invalidTime: LessThanOrEqual(moment(moment.now()).toDate())
    }
    let totalCount: number = 0;
    const orderArray = await this.orderRepository.find({ where })
    orderArray.map(async order => {
      if (order.type === '0') {
        this.logger.debug(`activityId: ${order.activityId}`)
        await this.orderRepository.manager.transaction(async manager => {
          // Set invalid status
          where.activityId = order.activityId
          order.status = '3'
          totalCount += order.count
          manager.save(order)
        })
        const countKey = COLLECTION_ORDER_COUNT + ":" + order.activityId;
        const [execError] = await this.redis.multi().incrby(countKey, order.count).exec()
      } else if (order.type === '1') {
        this.logger.debug(`assetId: ${order.assetId}`)
        await this.orderRepository.manager.transaction(async manager => {
          // Set invalid status
          where.assetId = order.assetId
          order.status = '3'
          totalCount += order.count
          manager.save(order)
          await manager.update(Asset, { id: order.assetId }, { status: '1' }) // Unlocked.
        })
      }

    })
    return totalCount;
  }
}
