import { Injectable } from '@nestjs/common';
import { CreateOrderDto, RequestBankcardOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderStatusDto } from './dto/update-order.dto';

import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { ASSET_ORDER_KEY } from '@app/common/contants/redis.contant';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Repository, FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ListMyOrderDto, ListOrderDto, ListUnpayOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { ConfigService } from '@nestjs/config';
import strRandom from 'string-random';
import { Bankcard } from '@app/modules/bankcard/entities/bankcard.entity';
import { User } from '@app/modules/system/user/entities/user.entity';

@Injectable()
export class OrderService {
  logger = new Logger(OrderService.name)
  platformAddress: string
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(Bankcard) private readonly bankcardRepository: Repository<Bankcard>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.platformAddress = this.configService.get<string>('crichain.platformAddress')
  }

  async createBankcardOrder(createOrderDto: RequestBankcardOrderDto, user: User) {
    let unpayOrderKey: string;
    const orderType = '1'

    unpayOrderKey = ASSET_ORDER_KEY + ":" + user.userId

    // 首先读取订单缓存，如果还有未完成订单，那么就直接返回订单。
    const unpayOrder = await this.redis.get(unpayOrderKey)
    if (unpayOrder != null) {
      throw new ApiException('无法创建订单', 401)
    }
    // 创建订单
    const order = new Order()
    order.id = parseInt('1' + strRandom(10, {letters: false}))
    order.status = '1'
    order.userId = user.userId
    order.userName = user.nickName
    order.assetId = createOrderDto.assetId
    order.assetType = createOrderDto.assetType
    order.count = 1
    order.invalidTime = moment().add(5, 'minute').toDate()

    return await this.orderRepository.manager.transaction(async manager => {
      if (createOrderDto.assetType === '0') { // 非实名卡
        let asset: Bankcard
        asset = await manager.findOne(Bankcard, { where: { id: order.assetId, status: '1' }, relations: {cardinfo: true} })
        if (!asset)
          throw new ApiException('市场上未发现此藏品')
        order.realPrice = asset.cardinfo.info.openFee
        order.totalPrice = order.realPrice

        order.desc = "[" + asset.cardinfo.name + "]" + asset.cardinfo.info.typeName
        order.image = asset.cardinfo.info.image
        await manager.save(order);
        await manager.update(Bankcard, { id: order.assetId }, { status: '2' }) // Asset is locked.

      }
      // 5 分钟
      await this.redis.set(unpayOrderKey, order.id, 'EX', 60 * 5)
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
      relations: { },
      skip: paginationDto.skip,
      take: paginationDto.take || 15,
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
      relations: {},
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
      relations: {},
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
    return this.orderRepository.findOne({ where: { id }, relations: {payment: true } })
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return this.orderRepository.update(id, updateOrderDto)
  }

  updatePaymentStatus(id: number, updateOrderDto: UpdateOrderStatusDto) {
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
    let order = await this.orderRepository.findOneBy({ id: id, status: '1' })
    let unpayOrderKey: string;
    if (userId != 0 || order.userId !== userId) {
      throw new ApiException("非本人订单")
    }
      
    // this.logger.debug(`assetId: ${order.assetId}`)
    unpayOrderKey = ASSET_ORDER_KEY + ":" + order.assetId
    await this.orderRepository.manager.transaction(async manager => {
      // Set invalid status
      // where.assetId = order.assetId
      order.status = '0'
      // totalCount += order.count
      manager.save(order)
      await manager.update(Bankcard, { id: order.assetId }, { status: '1' }) // Unlocked.
    })
    await this.redis.del(unpayOrderKey)
  }

  // /* 更新过期订单状态 */
  async syncInvalidOrder(activityId?: number) {
    let where: FindOptionsWhere<Order> = {}
    let result: any;
    where =
    {
      status: '1',
      invalidTime: LessThanOrEqual(moment(moment.now() + 1000 * 10).toDate())
    }
    let totalCount: number = 0;
    const order = await this.orderRepository.findOne({ where })
    if (!order) return

    this.logger.debug(`assetId: ${order.assetId}`)
    await this.orderRepository.manager.transaction(async manager => {
      // Set invalid status
      order.status = '0' // 取消订单
      await manager.save(order)
      await manager.update(Bankcard, { id: order.assetId }, { status: '0' }) // 设置为未激活.
    })

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

