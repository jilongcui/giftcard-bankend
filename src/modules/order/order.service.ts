import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable, Logger, ParseArrayPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { COLLECTION_ORDER_COUNT, ACTIVITY_ORDER_TEMPLATE_KEY, COLLECTION_ORDER_SUPPLY } from 'src/common/contants/redis.contant';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiException } from 'src/common/exceptions/api.exception';
import { Repository, FindConditions, Transaction, TransactionManager, EntityManager, getManager, MoreThanOrEqual } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { Activity } from '../activity/entities/activity.entity';
import { CreateAssetDto } from '../collection/dto/request-asset.dto';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { CreateOrderDto, ListOrderDto, UpdateOrderDto, UpdateOrderStatusDto } from './dto/request-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  logger = new Logger(OrderService.name)
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
    @InjectRedis() private readonly redis: Redis,
  ) {
  }
  async create(createOrderDto: CreateOrderDto, userId: number) {
    // 开启事务
    // 判断当前剩余
    // 如果有剩余，那么就生成订单
    // 否则，就失败
    let activity: Activity
    let orderCount: any
    let countKey = COLLECTION_ORDER_COUNT + ":" + createOrderDto.activityId;

    if (createOrderDto.type == '0') { // 一级市场活动创建订单
      const [execError] = await this.redis.multi().decr(countKey).exec()
      orderCount = execError[1]
      if (orderCount < 0) {
        // await this.redis.unwatch()
        throw new ApiException('已售完')
      }
      // this.logger.log(execError[0])
      this.logger.log(orderCount)
    }
    return await getManager().transaction(async manager => {


      const order = new Order();
      order.type = createOrderDto.type;
      order.status = '1';
      order.userId = userId;
      if (order.type == '0') { // 一级市场活动创建订单
        const activityJson = await this.redis.get(`${ACTIVITY_ORDER_TEMPLATE_KEY}:${createOrderDto.activityId}`)
        const jsonObject: any = JSON.parse(activityJson)
        activity = <Activity>jsonObject;
        order.activityId = createOrderDto.activityId;
        order.realPrice = activity.price;
        order.totalPrice = activity.price;
        order.image = activity.coverImage;
        order.desc = activity.title;
        order.invalidTime = moment().add(5, 'minute').toDate()
        order.collections = activity.collections;
      } else if (order.type === '1') { // 交易市场创建的订单
        const asset = await this.assetRepository.findOne({ where: { id: createOrderDto.activityId, status: 1 }, relations: ['collection'] })
        order.activityId = createOrderDto.activityId;
        order.realPrice = asset.value
        order.totalPrice = asset.value
        order.desc = asset.collection.name;
        order.image = asset.collection.images[0]
        order.invalidTime = moment().add(5, 'minute').toDate()
      }
      await manager.save(order);
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
    let where: FindConditions<Order> = {}
    let result: any;
    where = listOrderList;

    result = await this.orderRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where: [where, {}],
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
  async mylist(userId: number, paginationDto: PaginationDto): Promise<PaginatedDto<Order>> {
    // let where: FindConditions<Order> = [{}]
    let result: any;
    let where =
      [
        {
          userId: userId,
          status: '1',
          invalidTime: MoreThanOrEqual(moment(moment.now()).format())
        },
        {
          userId: userId,
          status: '2',
        },
      ]
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
  async myUnpayList(userId: number, paginationDto: PaginationDto): Promise<PaginatedDto<Order>> {
    // let where: FindConditions<Order> = [{}]
    let result: any;
    let where =
    {
      userId: userId,
      status: '1',
      invalidTime: MoreThanOrEqual(moment(moment.now()).format())
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
    return this.orderRepository.findOne(id, { relations: ["activity", "collections"], })
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
    const order = await this.orderRepository.findOne({ where: { id: id, userId: userId } })
    if (order == null) {
      throw new ApiException('错误订单')
    }
    if (order.status != '1') {
      throw new ApiException('订单状态错误')
    }
    let updateStatusDto = { status: '2' }
    const { affected } = await this.orderRepository.update({ id: id, status: '1', userId: userId }, updateStatusDto)
    if (affected == 0) {
      throw new ApiException('订单更新失败')
    }
    const result = await this.accountRepository.decrement({ user: { userId: userId }, usable: MoreThanOrEqual(order.realPrice) }, "usable", order.realPrice);
    // this.logger.log(JSON.stringify(result));
    if (!result.affected) {
      throw new ApiException('支付失败')
    }

    if (order.type === '0') { // 一级市场活动
      // Create assetes for user.
      const activity = await this.activityRepository.findOne({ where: { id: order.activityId }, relations: ['collections'] })
      // First we need get all collections of orders, but we only get one collection.
      if (!activity.collections || activity.collections.length <= 0) {
        return order;
      }
      let collection: Collection;
      if (order.activity.type = '1') {
        // 首发盲盒, 我们需要随机寻找一个。
        const index = Math.floor((Math.random() * activity.collections.length));
        collection = activity.collections[index]
      } else {
        // 其他类型，我们只需要取第一个
        collection = activity.collections[0];
      }
      let createAssetDto = { value: order.realPrice, assetNo: collection.current, userId: userId, collectionId: collection.id }
      await this.assetRepository.save(createAssetDto)
      // 把collection里的个数减少一个，这个时候需要通过交易完成，防止出现多发问题
      await this.collectionRepository.increment({ id: collection.id }, "current", 1);
      // 记录交易记录
      await this.assetRecordRepository.save({
        type: '2', // Buy
        assetId: id,
        price: order.realPrice,
        toId: userId,
        toName: userName
      })
      order.status = '2';

    } else if (order.type === '1') { // 二级市场资产交易
      // 把资产切换到新的用户就可以了
      await this.buyAsset(order.activityId, userId, userName)
      order.status = '2';
    }

    return order;
  }

  async buyAsset(id: number, userId: number, userName: string) {
    const asset = await this.assetRepository.findOne(id, { relations: ['user'] })
    const fromId = asset.user.userId
    const fromName = asset.user.userName
    if (fromId === userId)
      throw new ApiException("不能购买自己的资产")
    await this.assetRepository.update(id, { userId: userId })
    await this.assetRecordRepository.save({
      type: '2', // Buy
      assetId: id,
      price: asset.value,
      fromId: fromId,
      fromName: fromName,
      toId: userId,
      toName: userName
    })
  }
}
