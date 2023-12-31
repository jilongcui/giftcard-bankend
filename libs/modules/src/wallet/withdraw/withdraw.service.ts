import { ApiException } from '@app/common/exceptions/api.exception';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Withdraw } from './entities/withdraw.entity';
import { Between, FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedService } from '@app/shared';

import { ConfirmWithdrawDto, CreateWithdrawDto, WithdrawWithCardDto, ListMyWithdrawDto, ListWithdrawDto, ReqWithdrawNotifyDto } from './dto/create-withdraw.dto';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { WithdrawFlow } from './entities/withdraw-flow.entity';
import { Account } from '@app/modules/account/entities/account.entity';
import { AddressService } from '../address/address.service';
import { ReqAddressWithdrawDto } from '../address/dto/req-address.dto';
import { CurrencyService } from '@app/modules/currency/currency.service';
import { SYSCONF_WITHDRAW_FEE_KEY } from '@app/common/contants/sysconfig.contants';
import { SysConfigService } from '@app/modules/system/sys-config/sys-config.service';
import { AccountFlow, AccountFlowType, AccountFlowDirection } from '@app/modules/account/entities/account-flow.entity';
import { EmailService } from '@app/modules/email/email.service';

@Injectable()
export class WithdrawService {
  logger = new Logger(WithdrawService.name)
  constructor(
    private readonly configService: ConfigService,
    private readonly addressService: AddressService,
    private readonly sysconfigService: SysConfigService,
    private readonly currencyService: CurrencyService,
    private readonly emailService: EmailService,
    @InjectRepository(Withdraw) private readonly withdrawRepository: Repository<Withdraw>,
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  create(createWithdrawDto: CreateWithdrawDto) {
    return 'This action adds a new withdraw';
  }

  // 创建提现请求
  async createWithdrawRequest(createWithdrawDto: CreateWithdrawDto, userId: number) {
    const currency = await this.currencyService.findOneByName(createWithdrawDto.currency)
    this.logger.debug(currency)

    if (currency.status === '0') {
        throw new ApiException('此代币禁止已下架')
    }

    if (currency.withdrawEnable == false) {
        throw new ApiException('此代币禁止提币')
    }
    
    let amount = createWithdrawDto.amount
    if (amount <= 0.0) {
        throw new ApiException('输入金额有误')
    }

    const withdrawFeeString = await this.sysconfigService.getValue(SYSCONF_WITHDRAW_FEE_KEY)
    let withdrawFee = Number(withdrawFeeString)
    let fee = withdrawFee || 5.0 // usdt

    if (createWithdrawDto.amount <= fee) {
        throw new ApiException('提现金额低于手续费')
    }

    return await this.withdrawRepository.manager.transaction(async manager => {
        const result = await manager.decrement(Account, { userId: userId, currencyId: currency.id, usable: MoreThanOrEqual(createWithdrawDto.amount) }, "usable", createWithdrawDto.amount);
        if (!result.affected) {
            throw new ApiException('创建提现请求失败')
        }

        const result2 = await manager.increment(Account, { userId: userId, currencyId: currency.id,}, "freeze", createWithdrawDto.amount);
        if (!result2.affected) {
            throw new ApiException('创建提现请求失败')
        }

        const accountFlow = new AccountFlow()
        accountFlow.type = AccountFlowType.Withdraw
        accountFlow.direction = AccountFlowDirection.Out
        accountFlow.userId = userId
        accountFlow.amount = createWithdrawDto.amount
        accountFlow.currencyId = currency.id
        accountFlow.currencyName = currency.symbol
        accountFlow.balance = 0
        await manager.save(accountFlow)

        const withdraw = new Withdraw()
        withdraw.type = '1' // 提现到wallet地址
        withdraw.status = '0' // 待审核
        withdraw.currencyId = currency.id
        withdraw.toAddress = createWithdrawDto.toAddress
        withdraw.userId = userId
        withdraw.totalPrice = createWithdrawDto.amount
        withdraw.totalFee = fee
        withdraw.addressType = createWithdrawDto.addressType
        withdraw.realPrice = withdraw.totalPrice - withdraw.totalFee
        withdraw.billNo = this.randomBillNo()
        const withdraw2 = await manager.save(withdraw)

        const withdrawFlow = new WithdrawFlow()
        withdrawFlow.step = '0'
        withdrawFlow.status = '1'
        withdrawFlow.remark = '发起提现'
        withdrawFlow.withdrawId = withdraw2.id
        await manager.save(withdrawFlow)
        // withdraw2.bankcard = bankcard
        // withdraw2.bankcard.user = undefined
        // withdraw2.bankcard.identity = undefined
        // withdraw2.bankcard.signTradeNo = undefined

        this.emailService.sendSystemNotice(`【通知】用户发起钱包提币-${createWithdrawDto.amount}`, `用户${userId}发起银行卡提现-${createWithdrawDto.amount}`)

        return withdraw2
    })
  }

  private randomBillNo(): string {
    return Math.floor((Math.random() * 9000000000) + 1000000000).toString();
  }

  /* 获取总值 */
  async total(): Promise<any> {
    let result: any;
    
    const { totalPrice, totalFee } = await this.withdrawRepository
    .createQueryBuilder("profitRecord")
    .select("SUM(profitRecord.totalPrice)", "totalPrice")
    .addSelect("SUM(profitRecord.totalFee)", "totalFee")
    .where("profitRecord.status = :status", { status: '2'})
    .getRawOne()

    const { todayPrice, todayFee } = await this.withdrawRepository
    .createQueryBuilder("profitRecord")
    .select("SUM(profitRecord.totalPrice)", "todayPrice")
    .addSelect("SUM(profitRecord.totalFee)", "todayFee")
    .where("profitRecord.status = :status", { status: '2'})
    .andWhere("DATE(DATE_ADD(profitRecord.createTime,INTERVAL 8 HOUR)) = CURDATE()")
    .getRawOne()

    return {
        totalPrice: totalPrice,
        totalFee: totalFee,
        todayPrice: todayPrice,
        todayFee: todayFee
    }
  }

  // 确认提现请求
  async confirmWithdrawRequest(confirmWithdrawDto: ConfirmWithdrawDto, userId: number) {
    const withdraw = await this.withdrawRepository.findOneBy({ id: confirmWithdrawDto.withdrawId })
    if (withdraw === null) {
        throw new ApiException('提币记录不存在')
    }
    if (withdraw.status !== '0') {
        throw new ApiException('提币状态不对')
    }

    await this.withdrawRepository.manager.transaction(async manager => {
        withdraw.status = '1' // 已审核
        await manager.save(withdraw)

        const withdrawFlow = new WithdrawFlow()
        withdrawFlow.step = '1'
        withdrawFlow.status = '1'
        withdrawFlow.remark = '审核通过'
        withdrawFlow.withdrawId = withdraw.id
        await manager.save(withdrawFlow)
    })
    // toFix
    await this.doWithdrawWithCard(withdraw.id)
  }

  // 小额支付 API/PayTransit/PayTransferWithSmallAll.aspx
  async doWithdrawWithCard(withdrawId:number) {

    const withdraw = await this.withdrawRepository.findOne({where: { id: withdrawId }, relations: {currency: true}})
    if (withdraw === null) {
        throw new ApiException('提币记录不存在')
    }
    const reqAddessWithdraw: ReqAddressWithdrawDto = {
      address: withdraw.toAddress,
      currency: withdraw.currency.symbol,
      amount: withdraw.realPrice,
      addressType: withdraw.addressType,
      order: withdraw.billNo
    }
    return await this.addressService.addressWithdraw(reqAddessWithdraw, withdraw.userId)
  }

  async notifyWithdraw(withdrawNotifyDto: ReqWithdrawNotifyDto) {
    const withdraw = await this.withdrawRepository.findOne({where: { billNo: withdrawNotifyDto.orderNo }, relations: {currency: true}})
    if (withdraw === null) {
        throw new ApiException('提币记录不存在')
    }
    if (withdraw.status !== '1') {
        throw new ApiException('提币状态不正确')
    }

    if(withdrawNotifyDto.status !== '1') {
        return await this.withdrawRepository.manager.transaction(async manager => {
            // 把Withdraw的状态改成4: 失败
            await manager.update(Withdraw, { id: withdraw.id, status: '1' }, { status: '4' }) // 提现失败
            await manager.increment(Account, { userId: withdraw.userId, currencyId: withdraw.currencyId }, "usable", withdraw.totalPrice)
            await manager.decrement(Account, { userId: withdraw.userId, currencyId: withdraw.currencyId }, "freeze", withdraw.totalPrice);
            const accountFlow = new AccountFlow()
            accountFlow.type = AccountFlowType.WithdrawRevert
            accountFlow.direction = AccountFlowDirection.In
            accountFlow.userId = withdraw.userId
            accountFlow.amount = withdraw.totalPrice
            accountFlow.currencyId = withdraw.currencyId
            accountFlow.currencyName = withdraw.currency.symbol
            accountFlow.balance = 0
            await manager.save(accountFlow)
            return await this.withdrawRepository.save(withdraw)
        })
    }

    return await this.withdrawRepository.manager.transaction(async manager => {
        // 把Withdraw的状态改成2: 已支付
        // await manager.update(Withdraw, { id: withdraw.id, status: '1' }, { status: '2' })
        
        const result2 = await manager.decrement(Account, { userId: withdraw.userId, currencyId: withdraw.currencyId }, "freeze", withdraw.totalPrice);
        withdraw.status = '2'
        withdraw.txid = withdrawNotifyDto.txid
        return await this.withdrawRepository.save(withdraw)
    })

    
  }

  async cancel(id: number, userId: number) {
    let where: FindOptionsWhere<Withdraw> = {}
    let result: any;
    let withdraw = await this.withdrawRepository.findOne({where: { id: id }, relations: {currency: true}})
    if (withdraw.userId !== userId) {
        throw new ApiException("非本人提币")
    }
    // 银行卡提现 - 取消
    if (withdraw.type === '1') {
        await this.withdrawRepository.manager.transaction(async manager => {
            let result = await manager.update(Withdraw, { id: withdraw.id, status: '0' }, { status: '3' }) // Unlocked.
            if (result.affected <= 0) {
                throw new ApiException("未能取消提币")
            }
            result = await manager.increment(Account, { userId: userId, currencyId: withdraw.currencyId }, "usable", withdraw.totalPrice);
            if (!result.affected) {
                throw new ApiException('未能取消当前提现')
            }
            const result2 = await manager.decrement(Account, { userId: userId, currencyId: withdraw.currencyId }, "freeze", withdraw.totalPrice);

            this.logger.debug('Success')

            const accountFlow = new AccountFlow()
            accountFlow.type = AccountFlowType.WithdrawRevert
            accountFlow.direction = AccountFlowDirection.In
            accountFlow.userId = withdraw.userId
            accountFlow.amount = withdraw.totalPrice
            accountFlow.currencyId = withdraw.currencyId
            accountFlow.currencyName = withdraw.currency.symbol
            accountFlow.balance = 0
            await manager.save(accountFlow)

            const withdrawFlow = new WithdrawFlow()
            withdrawFlow.step = '1'
            withdrawFlow.status = '2'
            withdrawFlow.remark = '取消提现'
            withdrawFlow.withdrawId = withdraw.id
            await manager.save(withdrawFlow)
        })
    }
}

async fail(id: number, userId: number) {
    let where: FindOptionsWhere<Withdraw> = {}
    let result: any;
    let withdraw = await this.withdrawRepository.findOne({where: { id: id }, relations: {currency: true}})
    // 银行卡提现 - 审核未通过
    if (withdraw.type === '1') {
        await this.withdrawRepository.manager.transaction(async manager => {
            await manager.update(Withdraw, { id: withdraw.id }, { status: '5' }) // Unlocked.
            const result = await manager.increment(Account, { userId: withdraw.userId, currencyId: withdraw.currencyId }, "usable", withdraw.totalPrice);
            if (!result.affected) {
                throw new ApiException('未能拒绝当前提现')
            }
            const result2 = await manager.decrement(Account, { userId: userId, currencyId: withdraw.currencyId }, "freeze", withdraw.totalPrice);
            this.logger.debug('Success')
            const accountFlow = new AccountFlow()
            accountFlow.type = AccountFlowType.WithdrawRevert
            accountFlow.direction = AccountFlowDirection.In
            accountFlow.userId = withdraw.userId
            accountFlow.amount = withdraw.totalPrice
            accountFlow.currencyId = withdraw.currencyId
            accountFlow.currencyName = withdraw.currency.symbol
            accountFlow.balance = 0
            await manager.save(accountFlow)

            const withdrawFlow = new WithdrawFlow()
            withdrawFlow.step = '1'
            withdrawFlow.status = '2'
            withdrawFlow.remark = '审核未通过'
            withdrawFlow.withdrawId = withdraw.id
            await manager.save(withdrawFlow)
        })
    }
}

  async findOne(id: number) {
    return await this.withdrawRepository.findOne({ where: { id }, relations: {} })
  }

  /* 分页查询 */
  async list(listWithdrawList: ListWithdrawDto, paginationDto: PaginationDto): Promise<PaginatedDto<Withdraw>> {
    let where: FindOptionsWhere<Withdraw> = {}
    let result: any;
    where = {
        ...listWithdrawList
    }

    if(paginationDto.beginTime)
      where.createTime = Between(paginationDto.beginTime, paginationDto.endTime)
      
    result = await this.withdrawRepository.findAndCount({
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
  async mylist(userId: number, listMyWithdrawDto: ListMyWithdrawDto, paginationDto: PaginationDto): Promise<PaginatedDto<Withdraw>> {
      let where: FindOptionsWhere<ListWithdrawDto> = {}
      let result: any;
      where = {
          // ...listMyWithdrawDto,
          userId,
      }

      result = await this.withdrawRepository.findAndCount({
          // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
          where,
          // relations: { fromAddress: true },
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
