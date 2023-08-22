import { Injectable, Logger } from '@nestjs/common';
import { CreatePromotionAgent, CreatePromotionAgentDto, ListMyPromotionAgentDto, ListPromotionAgentDto } from './dto/create-promotion_agent.dto';
import { UpdatePromotionAgentDto, UpdatePromotionAgentStatusDto } from './dto/update-promotion_agent.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { ApiException } from '@app/common/exceptions/api.exception';
import { PromotionAgent } from './entities/promotion_agent.entity';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import stringRandom from 'string-random';
import { Order } from 'apps/giftcard/src/order/entities/order.entity';
import { ProfitRecord, ProfitType } from '../profit_record/entities/profit_record.entity';
import { Account } from '../account/entities/account.entity';
import { User } from '../system/user/entities/user.entity';
import { CurrencyService } from '../currency/currency.service';
import * as moment from 'moment';
import { AccountFlow, AccountFlowType, AccountFlowDirection } from '../account/entities/account-flow.entity';

@Injectable()
export class PromotionAgentService {
  logger = new Logger(PromotionAgentService.name)

  constructor(
    @InjectRepository(PromotionAgent) private readonly promoptionRepository: Repository<PromotionAgent>,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    private readonly currencyService: CurrencyService
  ) {
  }

  async create(createPromotionAgentDto: CreatePromotionAgentDto, userId: number) {
    const promoption = await this.promoptionRepository.findOneBy({userId, status: '2'})
    if(promoption) {
      throw new ApiException("已存在推广大使")
    }

    return await this.promoptionRepository.manager.transaction(async manager => {
      const promotionAgentfee = 100.00
      const currencyId = 1

      const account = await manager.findOne(Account, { where: { currencyId, userId, usable: MoreThanOrEqual(promotionAgentfee)} })
      if(!account) {
        throw new ApiException('资金不足')
      }
      const currency= await this.currencyService.findOneByName('USDT')

      const promotionAgent = new PromotionAgent()
      promotionAgent.city = createPromotionAgentDto.city
      promotionAgent.country = createPromotionAgentDto.country
      promotionAgent.email = createPromotionAgentDto.email
      promotionAgent.introduction = createPromotionAgentDto.introduction
      promotionAgent.advantage = createPromotionAgentDto.advantage
      promotionAgent.telegram = createPromotionAgentDto.telegram
      promotionAgent.kycId = createPromotionAgentDto.kycId
      promotionAgent.userId = userId
      promotionAgent.status = '1'
      await manager.decrement(Account, { userId: userId, currencyId }, "usable", promotionAgentfee)
      
      const accountFlow = new AccountFlow()
      accountFlow.type = AccountFlowType.PromotionAgent
      accountFlow.direction = AccountFlowDirection.Out
      accountFlow.userId = userId
      accountFlow.amount = promotionAgentfee
      accountFlow.currencyId = currencyId
      accountFlow.currencyName = currency.symbol
      accountFlow.balance = 0
      await manager.save(accountFlow )

      const promotion = await manager.save(promotionAgent)

      // 创建订单
      const order = new Order()
      order.id = parseInt('1' + stringRandom(8, {letters: false}))
      order.status = '4'
      order.userId = userId
      order.userName = ''
      order.assetId = promotion.id
      order.assetType = '2' // 申请推广大使费用
      order.userPhone = ''
      order.homeAddress = ''
      order.count = 1
      if (currency === null) {
        order.currencyId = 1
        order.currencySymbol = 'USDT'
      } else {
        order.currencyId = currency.id
        order.currencySymbol = currency.symbol
      }

      order.invalidTime = moment().add(5, 'minute').toDate()

      order.price = promotionAgentfee
      order.totalPrice = promotionAgentfee
      order.tradeFee = 0.0
      order.shipFee = 0.0
      order.desc = "申请推广大使费用"
      await manager.save(order);

      const profitRecordDto = new ProfitRecord()
      profitRecordDto.type = ProfitType.PromoteVipFee
      profitRecordDto.content = '申请推广大使收益',
      profitRecordDto.userId = userId,
      profitRecordDto.amount = order.totalPrice,
      profitRecordDto.fee = order.totalPrice,
      profitRecordDto.txid = 'orderId: ' + order.id
      await manager.save(profitRecordDto);

      return promotion
    })
  }

  async findOne(id: number) {
    return this.promoptionRepository.findOneBy({ id })
  }

  async findOneByUser(userId: number) {
    return this.promoptionRepository.findOneBy({userId})
  }

  // async findOneByOrderNo(orderNo: string) {
  //   return this.promoptionRepository.findOneBy({orderNo})
  // }

  update(id: number, updatePromotionAgentDto: UpdatePromotionAgentDto, userId: number) {
    const promoption = this.promoptionRepository.findOneBy({id: id, userId: userId})
    if (!promoption)
      throw new ApiException("非此用户的推广大使")
    return this.promoptionRepository.update(id, updatePromotionAgentDto)
  }

  updateStatus(id: number, updatePromotionAgentDto: UpdatePromotionAgentStatusDto, userId: number) {
    const promoption = this.promoptionRepository.findOneBy({id: id, userId: userId})
    if (!promoption)
      throw new ApiException("非此用户的推广大使")
    return this.promoptionRepository.update(id, updatePromotionAgentDto)
  }

  remove(id: number) {
    return this.promoptionRepository.delete(id)
  }

  async confirm(id: number) {
    let where: FindOptionsWhere<PromotionAgent> = {}
    let result: any;
    let promotion = await this.promoptionRepository.findOneBy({ id: id, status: '1' })
      
    await this.promoptionRepository.manager.transaction(async manager => {
      await manager.update(User, { userId: promotion.userId }, { promotionAgentId: promotion.id }) //
      await manager.update(PromotionAgent, { id: id }, { status: '2' }) // 
    })
  }

  async fail(id: number) {
    let where: FindOptionsWhere<PromotionAgent> = {}
    let result: any;
    const promotion = await this.promoptionRepository.findOneBy({ id: id, status: '1' })
    const order = await this.orderRepository.findOneBy({ assetId: id, assetType: '2' })
    
    await this.promoptionRepository.manager.transaction(async manager => {
      await manager.update(PromotionAgent, { id: promotion.id }, { status: '3' }) // kyc fail.
      await manager.update(Order, { id: order.id }, { status: '0' }) // failer.
      await manager.increment(Account, { userId: promotion.userId, currencyId: order.currencyId }, "usable", order.totalPrice)
      const accountFlow = new AccountFlow()
      accountFlow.type = AccountFlowType.PromotionAgentRevert
      accountFlow.direction = AccountFlowDirection.In
      accountFlow.userId = promotion.userId
      accountFlow.amount = order.totalPrice
      accountFlow.currencyId = order.currencyId
      accountFlow.currencyName = order.currencySymbol
      accountFlow.balance = 0
      await manager.save(accountFlow )
    })
  }

  async cancel(id: number, userId: number) {
    let where: FindOptionsWhere<PromotionAgent> = {}
    let result: any;
    let promotion = await this.promoptionRepository.findOneBy({ id: id, status: '1' })
    if (userId == 0 || promotion.userId !== userId) {
      throw new ApiException("非本人订单")
    }
    const order = await this.orderRepository.findOneBy({ assetId: id, assetType: '2' })
      
    await this.promoptionRepository.manager.transaction(async manager => {
      await manager.update(PromotionAgent, { id: promotion.id }, {status: '0' })
      await manager.update(Order, { id: order.id }, { status: '0' }) // cancel.
      await manager.increment(Account, { userId: userId, currencyId: order.currencyId }, "usable", order.totalPrice)

      const accountFlow = new AccountFlow()
      accountFlow.type = AccountFlowType.PromotionAgentRevert
      accountFlow.direction = AccountFlowDirection.In
      accountFlow.userId = promotion.userId
      accountFlow.amount = order.totalPrice
      accountFlow.currencyId = order.currencyId
      accountFlow.currencyName = order.currencySymbol
      accountFlow.balance = 0
      await manager.save(accountFlow )
    })
  }

  /* 分页查询 */
  async list(listPromotionAgentList: ListPromotionAgentDto, paginationDto: PaginationDto): Promise<PaginatedDto<PromotionAgent>> {
    let where: FindOptionsWhere<ListPromotionAgentDto> = {}
    let result: any;
    where = listPromotionAgentList

    result = await this.promoptionRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { user: true },
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
  async mylist(userId: number, listMyPromotionAgentDto: ListMyPromotionAgentDto, paginationDto: PaginationDto): Promise<PaginatedDto<PromotionAgent>> {
    let where: FindOptionsWhere<ListPromotionAgentDto> = {}
    let result: any;
    where = {
      ...listMyPromotionAgentDto,
      userId,
    }

    result = await this.promoptionRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: ["user"],
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
}
