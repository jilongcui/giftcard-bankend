import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { CreateAccountDto, ExhangeAccountDto, ListAccountDto, ListMyAccountDto, UpdateAccountDto, UpdateAllAccountDto } from './dto/request-account.dto';
import { Account } from './entities/account.entity';
import { Currency } from '../currency/entities/currency.entity';
import { ApiException } from '@app/common/exceptions/api.exception';

@Injectable()
export class AccountService {
  logger = new Logger(AccountService.name)
  constructor(
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRepository(Currency) private readonly currencyRepository: Repository<Currency>,
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
    const ratio = currencyTo.exratio / currencyFrom.exratio

    const fromAmount = exhangeAccountDto.amount
    const exchangeFee = fromAmount * 0.01 // toFixed
    const toAmount = (fromAmount - exchangeFee) * ratio

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
    })
    //
  }
}
