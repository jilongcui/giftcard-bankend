import { ApiException } from '@app/common/exceptions/api.exception';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Withdraw } from './entities/withdraw.entity';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedService } from '@app/shared';

import { ConfirmWithdrawDto, CreateWithdrawDto, WithdrawWithCardDto, ListMyWithdrawDto, ListWithdrawDto } from './dto/create-withdraw.dto';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { WithdrawFlow } from './entities/withdraw-flow.entity';
import { Account } from '@app/modules/account/entities/account.entity';
import { AddressService } from '../address/address.service';
import { ReqAddressWithdrawDto } from '../address/dto/req-address.dto';

@Injectable()
export class WithdrawService {
  logger = new Logger(WithdrawService.name)
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly addressService: AddressService,
    private readonly sharedService: SharedService,
    @InjectRepository(Withdraw) private readonly withdrawRepository: Repository<Withdraw>,
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  create(createWithdrawDto: CreateWithdrawDto) {
    return 'This action adds a new withdraw';
  }

  // 创建提现请求
  async createWithdrawRequest(createWithdrawDto: CreateWithdrawDto, userId: number) {
    // const address = await this.addressService.findOneByUser(createWithdrawDto.fromAddressId)
    // this.logger.debug(address)
    // // if (bankcard.signNo === undefined || bankcard.signNo === '') {
    // //     throw new ApiException('此银行卡没有实名')
    // // }
    // if (address.status === '0' || address.status === '2') {
    //     throw new ApiException('此银行卡未绑定')
    // }
    
    let amount = createWithdrawDto.amount

    let fee = amount * 1 / 1000
    if (fee < 1.0) fee = 1.0
    amount = amount - fee

    if (createWithdrawDto.amount <= fee) {
        throw new ApiException('提现金额低于手续费')
    }

    return await this.withdrawRepository.manager.transaction(async manager => {
        const result = await manager.decrement(Account, { user: { userId: userId }, usable: MoreThanOrEqual(createWithdrawDto.amount) }, "usable", createWithdrawDto.amount);
        if (!result.affected) {
            throw new ApiException('创建提现请求失败')
        }

        const result2 = await manager.increment(Account, { user: { userId: userId } }, "freeze", createWithdrawDto.amount);
        if (!result2.affected) {
            throw new ApiException('创建提现请求失败')
        }

        const withdraw = new Withdraw()
        withdraw.type = '1' // 银行卡提现
        withdraw.status = '0' // 待审核
        withdraw.fromAddressId = createWithdrawDto.addressId
        withdraw.toAddress = createWithdrawDto.toAddress
        withdraw.userId = userId
        withdraw.totalPrice = createWithdrawDto.amount
        withdraw.totalFee = fee
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
        return withdraw2
    })
  }

  private randomBillNo(): string {
    return Math.floor((Math.random() * 9000000000) + 1000000000).toString();
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
    await this.doWithdrawWithCard(withdraw.id, userId)
  }

  // 小额支付 API/PayTransit/PayTransferWithSmallAll.aspx
  async doWithdrawWithCard(withdrawId:number, userId: number) {
    // const requestUri = 'API/PayTransit/PayTransferWithSmallAll.aspx'
    // const address = await this.addressService.findAddress(payWithCard.fromAddressId)
    // this.logger.debug(address)
    // if (address === null) {
    //     throw new ApiException('此银行卡没有实名')
    // }
    // if (address.status === '0' || address.status === '2') {
    //     throw new ApiException('此银行卡未绑定')
    // }
    

    const withdraw = await this.withdrawRepository.findOne({where: { id: withdrawId }})
    if (withdraw === null) {
        throw new ApiException('提币记录不存在')
    }

    const reqAddessWithdraw: ReqAddressWithdrawDto = {
      address: withdraw.toAddress,
      amount: withdraw.totalPrice,
      addressType: withdraw.addressType,
      order: withdraw.billNo
    }
    const address = await this.addressService.addressWithdraw(reqAddessWithdraw, userId)

    await this.withdrawRepository.manager.transaction(async manager => {
        // 把Withdraw的状态改成2: 已支付
        await manager.update(Withdraw, { id: withdraw.id }, { status: '2' })
        await manager.increment(Account, { userId: 1 }, "usable", withdraw.totalFee)
        const result2 = await manager.decrement(Account, { user: { userId: userId } }, "freeze", withdraw.totalPrice);
        

        return await this.withdrawRepository.save(withdraw)
    })
  }

  async cancel(id: number, userId: number) {
    let where: FindOptionsWhere<Withdraw> = {}
    let result: any;
    let withdraw = await this.withdrawRepository.findOneBy({ id: id })
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
            result = await manager.increment(Account, { user: { userId: userId }, }, "usable", withdraw.totalPrice);
            if (!result.affected) {
                throw new ApiException('未能取消当前提现')
            }
            const result2 = await manager.decrement(Account, { user: { userId: userId } }, "freeze", withdraw.totalPrice);

            this.logger.debug('Success')

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
    let withdraw = await this.withdrawRepository.findOneBy({ id: id })
    // 银行卡提现 - 审核未通过
    if (withdraw.type === '1') {
        await this.withdrawRepository.manager.transaction(async manager => {
            await manager.update(Withdraw, { id: withdraw.id }, { status: '5' }) // Unlocked.
            const result = await manager.increment(Account, { user: { userId: withdraw.userId }, }, "usable", withdraw.totalPrice);
            if (!result.affected) {
                throw new ApiException('未能拒绝当前提现')
            }
            const result2 = await manager.decrement(Account, { user: { userId: userId } }, "freeze", withdraw.totalPrice);
            this.logger.debug('Success')
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
