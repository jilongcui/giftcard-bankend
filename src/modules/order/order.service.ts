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
import { CreateOrderDto, ListOrderDto, UpdateOrderDto, UpdateOrderStatusDto } from './dto/request-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  logger = new Logger(OrderService.name)
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
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

    do {
      const [execError] = await this.redis.multi().decr(countKey).exec()
      orderCount = execError[1]
      if (orderCount < 0) {
        // await this.redis.unwatch()
        throw new ApiException('已售完')
      }
      // this.logger.log(execError[0])
      this.logger.log(orderCount)
    } while (0)

    return await getManager().transaction(async manager => {

      const activityJson = await this.redis.get(`${ACTIVITY_ORDER_TEMPLATE_KEY}:${createOrderDto.activityId}`)
      const jsonObject: any = JSON.parse(activityJson)
      activity = <Activity>jsonObject;
      const order = new Order();
      order.type = createOrderDto.type;
      order.activityId = createOrderDto.activityId;
      order.realPrice = activity.price;
      order.totalPrice = activity.price;
      order.desc = activity.title;
      order.status = '1';
      order.userId = userId;
      order.invalidTime = moment(moment.now()).add(5, 'minute').toDate()
      order.collections = activity.collections;
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
      where,
      relations: ["activity", "collections"],
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

  async payWithBalance(id: number, userId: number) {
    this.logger.debug(userId);
    const order = await this.orderRepository.findOne({ id: id, userId: userId })
    if (order == null) {
      throw new ApiException('错误订单')
    }
    if (order.status != '1') {
      throw new ApiException('订单状态错误')
    }
    let updateStatusDto = new UpdateOrderStatusDto();
    updateStatusDto.status = '2'; // 订单完成
    const { affected } = await this.orderRepository.update({ id: id, status: '1', userId: userId }, updateStatusDto)
    if (affected == 0) {
      throw new ApiException('订单')
    }
    const result = await this.accountRepository.decrement({ user: { userId: userId }, usable: MoreThanOrEqual(order.realPrice) }, "usable", order.realPrice);
    this.logger.log(JSON.stringify(result));
    if (!result.affected) {
      throw new ApiException('支付失败')
    }
    order.status = '2';
    return order;
  }
}
