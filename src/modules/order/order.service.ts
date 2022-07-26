import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiException } from 'src/common/exceptions/api.exception';
import { Repository, FindConditions, Transaction, TransactionManager, EntityManager, getManager } from 'typeorm';
import { Activity } from '../activity/entities/activity.entity';
import { CreateOrderDto, ListOrderDto, UpdateOrderDto } from './dto/request-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,

  ) { }
  // @Transaction({ isolation: "SERIALIZABLE" })
  async create(createOrderDto: CreateOrderDto, userId: number) {
    // 开启事务
    // 判断当前剩余
    // 如果有剩余，那么就生成订单
    // 否则，就失败
    await getManager().transaction(async manager => {
      // NOTE: you must perform all database operations using the given manager instance
      // it's a special instance of EntityManager working with this transaction
      // and don't forget to await things here
      // 注意：你必须使用给定的管理器实例执行所有数据库操作，
      // 它是一个使用此事务的EntityManager的特殊实例。
      // 在这里处理一些操作
      const activity = await this.activityRepository.findOne(createOrderDto.activityId, { relations: ['collections'] });
      if (!activity) {
        throw new ApiException('未找到此活动')
      }
      if (activity.current < activity.supply) {
        activity.current++;
        await manager.save(activity);
        const order = new Order();
        order.type = createOrderDto.type;
        order.activityId = createOrderDto.activityId;
        order.realPrice = createOrderDto.realPrice;
        order.totalPrice = createOrderDto.totalPrice;
        order.desc = activity.title;
        order.status = '1';
        order.userId = userId;
        order.collections = activity.collections;
        return await manager.save(order);
      } else {
        throw new ApiException('已售完')
      }
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
    return this.orderRepository.findOne(id, { relations: ["activity", "user", "collections"], })
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
}
