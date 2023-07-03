import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { CreateAccountDto, ExhangeAccountDto, ListAccountDto, ListMyAccountDto, TransferAccountDto, UpdateAccountDto, UpdateAllAccountDto } from './dto/request-account.dto';
import { Account } from './entities/account.entity';
import { Currency } from '../currency/entities/currency.entity';
import { ApiException } from '@app/common/exceptions/api.exception';
import { UserService } from '../system/user/user.service';
import { Exchange } from '../exchange/entities/exchange.entity';
import { Transfer } from '../transfer/entities/transfer.entity';
import { CreateProfitRecordDto } from '../profit_record/dto/create-profit_record.dto';
import { ProfitSubType, ProfitType } from '../profit_record/entities/profit_record.entity';
import { ProfitRecordService } from '../profit_record/profit_record.service';
import { BrokerageRecord, BrokerageType } from '../brokerage_record/entities/brokerage_record.entity';
import { InviteUser } from '../inviteuser/entities/invite-user.entity';
import { SYSCONF_EXCHANGE_BROKERAGE_KEY } from '@app/common/contants/sysconfig.contants';
import { SysConfigService } from '../system/sys-config/sys-config.service';
import { BrokerageRecordService } from '../brokerage_record/brokerage_record.service';
import { AccountFlow, AccountFlowType, AccountFlowDirection } from './entities/account-flow.entity';

@Injectable()
export class AccountService {
  logger = new Logger(AccountService.name)
  constructor(
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRepository(Currency) private readonly currencyRepository: Repository<Currency>,
    private readonly profitRecordService: ProfitRecordService,
    private readonly brokerageRecordService: BrokerageRecordService,
    private readonly userService: UserService,
    private readonly sysconfigService: SysConfigService,
  ) { }

  create(createAccountDto: CreateAccountDto) {
    return this.accountRepository.save(createAccountDto);
  }

  /* 新增或编辑 */
  async addOrUpdateAll(createAccountDto: UpdateAllAccountDto) {
    return await this.accountRepository.save(createAccountDto)
  }

  /* 分页查询 */
  async list(listAccountList: ListAccountDto, paginationDto: PaginationDto): Promise<PaginatedDto<Account>> {
    let where: FindOptionsWhere<Account> = {}
    let result: any;
    where = listAccountList;
    result = await this.accountRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { currency: true },
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
  async mylist(listAccountList: ListMyAccountDto, userId: number, paginationDto: PaginationDto): Promise<PaginatedDto<Account>> {
    let where: FindOptionsWhere<Account> = {}
    let result: any;
    where = {
      ... listAccountList,
      userId
    }
    result = await this.accountRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { currency: true },
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        id: 'ASC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.accountRepository.findOneBy({ id })
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return this.accountRepository.update(id, updateAccountDto)
  }

  deleteOne(id: number) {
    return this.accountRepository.delete(id)
  }

  async delete(ids: number[] | string[]) {
    return this.accountRepository.delete(ids)
  }

  freeze(id: number) {
    let updateAccountDto: UpdateAccountDto = {
      status: '2' //  freeze
    }
    return this.accountRepository.update(id, updateAccountDto)
  }

  release(id: number) {
    let updateAccountDto: UpdateAccountDto = {
      status: '0' //  freeze
    }
    return this.accountRepository.update(id, updateAccountDto)
  }

  async exchange(exhangeAccountDto: ExhangeAccountDto, userId: number) {

    // this.logger.debug('exchange')
    // FROM USDT to HKD BUY
    // FROM HKD to USDT SELL 
    const currencyFrom = await this.currencyRepository.findOneBy({id: exhangeAccountDto.currIdFrom})
    const currencyTo = await this.currencyRepository.findOneBy({id: exhangeAccountDto.currIdTo})
    let action
    let usdtRatio
    let realRatio
    if(currencyFrom.symbol === 'USDT') {
      action = 'SELL'
      usdtRatio = currencyFrom.sell_exratio
      realRatio = (currencyFrom.sell_exratio + Math.abs(currencyFrom.sell_exratioBias)) / currencyTo.sell_exratio
    } else if(currencyTo.symbol === 'USDT') {
      action = 'BUY'
      usdtRatio = currencyTo.buy_exratio
      realRatio = currencyFrom.buy_exratio / (currencyTo.buy_exratio - Math.abs(currencyFrom.buy_exratioBias))
    }
    this.logger.debug(usdtRatio)
    const fromAmount = exhangeAccountDto.amount
    const exchangeFee = fromAmount * 0.01 // toFixed
    const toAmount = (fromAmount - exchangeFee) * realRatio
    // const fromAmount = amount + exchangeFee

    this.logger.debug(`fromAmount: ${fromAmount} fee: ${exchangeFee} toAmount: ${toAmount}`)

    // Exchange
    return this.accountRepository.manager.transaction(async manager => {

      const account = await manager.findOneBy(Account,{
        currencyId:exhangeAccountDto.currIdFrom,
        userId:userId,
        usable: MoreThanOrEqual(fromAmount)
      })
      if(!account) {
        throw new ApiException('资金不足')
      }

      await manager.decrement(Account, { userId: userId, currencyId: currencyFrom.id }, "usable", fromAmount)
      await manager.increment(Account, { userId: userId, currencyId: currencyTo.id }, "usable", toAmount)
      await manager.update(InviteUser, {id: userId}, {isExchangeUsdt: true})

      // Add Account Flow
      const accountFlow = new AccountFlow()
      accountFlow.type = AccountFlowType.Exchange
      accountFlow.direction = AccountFlowDirection.Out
      accountFlow.userId = userId
      accountFlow.amount = fromAmount
      accountFlow.currencyId = currencyFrom.id
      accountFlow.currencyName = currencyFrom.symbol
      accountFlow.balance = 0
      await manager.save(accountFlow)

      const accountFlow2 = new AccountFlow()
      accountFlow2.type = AccountFlowType.Exchange
      accountFlow2.direction = AccountFlowDirection.In
      accountFlow2.userId = userId
      accountFlow2.amount = toAmount
      accountFlow2.currencyId = currencyTo.id
      accountFlow2.currencyName = currencyTo.symbol
      accountFlow2.balance = 0
      await manager.save(accountFlow2)
      
      const exchange = new Exchange()
      exchange.fromAmount = fromAmount
      exchange.fee = exchangeFee
      exchange.toAmount = toAmount
      exchange.ratio = usdtRatio
      exchange.fromCurrencyId = currencyFrom.id
      exchange.toCurrencyId = currencyTo.id
      exchange.status = '1' // 
      exchange.userId = userId
      const exchange2 = await manager.save(exchange)
      const inviteUser  = await manager.findOneBy(InviteUser, { id: userId })
      let parentId = inviteUser?.parentId

      let subType
      let content
      if(currencyFrom.symbol === 'USDT') {
        subType = ProfitSubType.USDT
        content = 'USDT转HKD收益'
        const profitRecordDto: CreateProfitRecordDto ={
          type: ProfitType.ExchangeFee,
          subtype: subType,
          content: content,
          userId: userId,
          amount: fromAmount,
          fee: exchangeFee,
          txid: 'exchangeId: ' + exchange2.id
        }
        await this.profitRecordService.create(profitRecordDto)
      }
      // else if(currencyFrom.symbol === 'HKD') {
      //   subType = ProfitSubType.HKD
      //   content = 'HKD转USDT收益'
      // }

      if(parentId && currencyFrom.symbol === 'USDT') {
        const brokerageRatioString = await this.sysconfigService.getValue(SYSCONF_EXCHANGE_BROKERAGE_KEY)
        this.logger.debug(brokerageRatioString || "0.2")
        const brokerageRatio = Number(brokerageRatioString || "0.2")
        const brokerageRecordDto = new BrokerageRecord()
        brokerageRecordDto.type = BrokerageType.ExchangeBrokerage,
        brokerageRecordDto.content = 'USDT转HKD提成',
        brokerageRecordDto.userId = parentId,
        brokerageRecordDto.fromUserId = userId,
        brokerageRecordDto.amount = fromAmount,
        brokerageRecordDto.value = exchangeFee * brokerageRatio,
        brokerageRecordDto.txid = 'exchangeId: ' + exchange2.id
        await manager.save(brokerageRecordDto)

        const accountFlow3 = new AccountFlow()
        accountFlow3.type = AccountFlowType.ExchangeBrokerage
        accountFlow3.direction = AccountFlowDirection.In
        accountFlow3.userId = parentId
        accountFlow3.amount = exchangeFee * brokerageRatio
        accountFlow3.currencyId = currencyFrom.id
        accountFlow3.currencyName = currencyFrom.symbol
        accountFlow3.balance = 0
        await manager.save(accountFlow3)

        await manager.increment(Account, { userId: parentId, currencyId: currencyFrom.id }, "usable",  exchangeFee * brokerageRatio)
      }

      return exchange2
    })
    //
  }

  async transfer(tranferAccountDto: TransferAccountDto, userId: number) {

    // this.logger.debug('exchange')
    const currency = await this.currencyRepository.findOneBy({id: tranferAccountDto.currencyId})

    this.logger.debug(JSON.stringify(currency))
    const user = await this.userService.findOneByUserId(tranferAccountDto.userTo)
    const toAmount = tranferAccountDto.amount
    const transferFee = toAmount * 0.001 // toFixed
    const fromAmount = toAmount + transferFee

    // Transfer
    return this.accountRepository.manager.transaction(async manager => {

      const account = await manager.findOneBy(Account,{
        currencyId:tranferAccountDto.currencyId,
        userId:userId,
        usable: MoreThanOrEqual(fromAmount)
      })
      if(!account) {
        throw new ApiException('资金不足')
      }
      await manager.decrement(Account, { userId: userId, currencyId: currency.id }, "usable", fromAmount)
      await manager.increment(Account, { userId: user.userId, currencyId: currency.id }, "usable", toAmount)
      await manager.increment(Account, { userId: 1 }, "usable", transferFee)

      // Add Account Flow
      const accountFlow = new AccountFlow()
      accountFlow.type = AccountFlowType.Transfer
      accountFlow.direction = AccountFlowDirection.Out
      accountFlow.userId = userId
      accountFlow.amount = fromAmount
      accountFlow.currencyId = currency.id
      accountFlow.currencyName = currency.symbol
      accountFlow.balance = 0
      await manager.save(accountFlow)

      const accountFlow2 = new AccountFlow()
      accountFlow2.type = AccountFlowType.Transfer
      accountFlow2.direction = AccountFlowDirection.In
      accountFlow2.userId = user.userId
      accountFlow2.amount = toAmount
      accountFlow2.currencyId = currency.id
      accountFlow2.currencyName = currency.symbol
      accountFlow2.balance = 0
      await manager.save(accountFlow2)

      const transfer = new Transfer()
      transfer.fromAmount = toAmount
      transfer.fee = transferFee
      transfer.toAmount = toAmount
      transfer.fromUserId = userId
      transfer.toUserId = user.userId
      transfer.currencyId = currency.id
      transfer.status = '1' // 
      transfer.userId = userId
      const transfer2 = await manager.save(transfer)
      let subType
      this.logger.debug(currency.symbol)
      if(currency.symbol === 'USDT')
        subType = ProfitSubType.USDT
      else if(currency.symbol === 'HKD')
        subType = ProfitSubType.HKD

      const profitRecordDto: CreateProfitRecordDto ={
        type: ProfitType.InnerTransferFee,
        subtype: subType,
        content: user.userId.toString(),
        userId: userId,
        amount: toAmount,
        fee: transferFee,
        txid: 'transferId: ' + transfer2.id
      }
      await this.profitRecordService.create(profitRecordDto)
      return transfer2
    })
    //
  }

}
