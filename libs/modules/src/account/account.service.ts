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
import { ProfitRecordService } from '../profit_record/profit_record.service';
import { CreateProfitRecordDto } from '../profit_record/dto/create-profit_record.dto';
import { ProfitType } from '../profit_record/entities/profit_record.entity';

@Injectable()
export class AccountService {
  logger = new Logger(AccountService.name)
  constructor(
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRepository(Currency) private readonly currencyRepository: Repository<Currency>,
    private readonly profitRecordService: ProfitRecordService,
    private readonly userService: UserService,
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
        createTime: 'DESC',
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
    const currencyFrom = await this.currencyRepository.findOneBy({id: exhangeAccountDto.currIdFrom})
    const currencyTo = await this.currencyRepository.findOneBy({id: exhangeAccountDto.currIdTo})
    // this.logger.debug(`ratio ${currencyTo.exratio} / ${currencyFrom.exratio}`)
    const ratio = currencyFrom.exratio / currencyTo.exratio

    const fromAmount = exhangeAccountDto.amount
    const exchangeFee = fromAmount * 0.01 // toFixed
    const toAmount = (fromAmount - exchangeFee) * ratio

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
      await manager.increment(Account, { userId: 1 }, "usable", exchangeFee)
      const exchange = new Exchange()
      exchange.fromAmount = fromAmount
      exchange.fee = exchangeFee
      exchange.toAmount = toAmount
      exchange.fromCurrencyId = currencyFrom.id
      exchange.toCurrencyId = currencyTo.id
      exchange.status = '1' // 
      exchange.userId = userId
      const exchange2 = await manager.save(exchange)

      const profitRecordDto: CreateProfitRecordDto ={
        type: ProfitType.ExchangeFee,
        content: 'USDT转HKD',
        userId: userId,
        amount: fromAmount,
        fee: exchangeFee,
        txid: 'exchangeId: ' + exchange2.id
      }
      await this.profitRecordService.create(profitRecordDto)

      return exchange2
    })
    //
  }

  async transfer(tranferAccountDto: TransferAccountDto, userId: number) {

    // this.logger.debug('exchange')
    const currency = await this.currencyRepository.findOneBy({id: tranferAccountDto.currencyId})

    const user = await this.userService.findOneByMixName(tranferAccountDto.userTo)
    const fromAmount = tranferAccountDto.amount
    const transferFee = fromAmount * 0.01 // toFixed
    const toAmount = fromAmount - transferFee

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
      const transfer = new Transfer()
      transfer.fromAmount = fromAmount
      transfer.fee = transferFee
      transfer.toAmount = toAmount
      transfer.fromUserId = userId
      transfer.toUserId = user.userId
      transfer.currencyId = currency.id
      transfer.status = '1' // 
      transfer.userId = userId
      const transfer2 = await manager.save(transfer)
      const profitRecordDto: CreateProfitRecordDto ={
        type: ProfitType.InnerTransferFee,
        content: user.userId.toString(),
        userId: userId,
        amount: fromAmount,
        fee: transferFee,
        txid: 'transferId: ' + transfer2.id
      }
      await this.profitRecordService.create(profitRecordDto)
      return transfer2
    })
    //
  }

}
