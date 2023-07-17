import { Injectable } from '@nestjs/common';
import { ListExchangeDto } from './dto/create-exchange.dto';
import { Exchange } from './entities/exchange.entity';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '@app/common/dto/pagination.dto';

@Injectable()
export class ExchangeService {

  constructor(
    @InjectRepository(Exchange) private readonly exchangeRepository: Repository<Exchange>) {}
  
  /* 分页查询 */
  async list(listExchangeDto: ListExchangeDto, paginationDto: PaginationDto): Promise<PaginatedDto<Exchange>> {
    let where: FindOptionsWhere<Exchange> = {}
    if (listExchangeDto.fromCurrencyId) {
      where.fromCurrencyId = listExchangeDto.fromCurrencyId
    }

    if (listExchangeDto.userId) {
      where.userId = listExchangeDto.userId
    }

    if (listExchangeDto.toCurrencyId) {
      where.toCurrencyId = listExchangeDto.toCurrencyId
    }

    if (listExchangeDto.status) {
        where.status = listExchangeDto.status
    }
    const result = await this.exchangeRepository.findAndCount({
        // select: ['id', 'txid', 'type', 'userId', 'confirmState', 'status'],
        relations: {fromCurrency: true, toCurrency: true},
        where,
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

  /* 个人分页查询 */
  async mylist(userId: number, listExchangeDto: ListExchangeDto, paginationDto: PaginationDto): Promise<PaginatedDto<Exchange>> {
    let where: FindOptionsWhere<Exchange> = {}
    if (listExchangeDto.fromCurrencyId) {
      where.fromCurrencyId = listExchangeDto.fromCurrencyId
    }

    if (listExchangeDto.toCurrencyId) {
      where.toCurrencyId = listExchangeDto.toCurrencyId
    }

    if (listExchangeDto.status) {
        where.status = listExchangeDto.status
    }

    where.userId = userId

    const result = await this.exchangeRepository.findAndCount({
        // select: ['id', 'txid', 'type', 'userId', 'confirmState', 'status'],
        relations: {fromCurrency: true, toCurrency: true},
        where,
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
