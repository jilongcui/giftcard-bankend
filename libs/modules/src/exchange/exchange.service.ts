import { Injectable } from '@nestjs/common';
import { ReqExchangeListDto } from './dto/create-exchange.dto';
import { Exchange } from './entities/exchange.entity';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ExchangeService {

  constructor(
    @InjectRepository(Exchange) private readonly exchangeRepository: Repository<Exchange>) {}
  
  /* 分页查询 */
  async list(reqExchangeList: ReqExchangeListDto): Promise<PaginatedDto<Exchange>> {
    let where: FindOptionsWhere<Exchange> = {}
    if (reqExchangeList.fromCurrencyId) {
      where.fromCurrencyId = reqExchangeList.fromCurrencyId
    }

    if (reqExchangeList.toCurrencyId) {
      where.toCurrencyId = reqExchangeList.toCurrencyId
    }

    if (reqExchangeList.status) {
        where.status = reqExchangeList.status
    }
    const result = await this.exchangeRepository.findAndCount({
        // select: ['id', 'txid', 'type', 'userId', 'confirmState', 'status'],
        relations: {fromCurrency: true, toCurrency: true},
        where,
        skip: reqExchangeList.skip,
        take: reqExchangeList.take
    })
    return {
        rows: result[0],
        total: result[1]
    }
  }

  /* 个人分页查询 */
  async mylist(reqExchangeList: ReqExchangeListDto, userId: number): Promise<PaginatedDto<Exchange>> {
    let where: FindOptionsWhere<Exchange> = {}
    if (reqExchangeList.fromCurrencyId) {
      where.fromCurrencyId = reqExchangeList.fromCurrencyId
    }

    if (reqExchangeList.toCurrencyId) {
      where.toCurrencyId = reqExchangeList.toCurrencyId
    }

    if (reqExchangeList.status) {
        where.status = reqExchangeList.status
    }

    where.userId = userId

    const result = await this.exchangeRepository.findAndCount({
        // select: ['id', 'txid', 'type', 'userId', 'confirmState', 'status'],
        relations: {fromCurrency: true, toCurrency: true},
        where,
        skip: reqExchangeList.skip,
        take: reqExchangeList.take
    })
    return {
        rows: result[0],
        total: result[1]
    }
  }
}
