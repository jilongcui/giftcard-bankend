import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateCurrencyDto, ListCurrencyDto, UpdateCurrencyDto } from './dto/request-currency.dto';
import { Currency } from './entities/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency) private readonly currencyRepository: Repository<Currency>,
  ) { }
  create(createCurrencyDto: CreateCurrencyDto) {
    return this.currencyRepository.save(createCurrencyDto);
  }

  /* 新增或编辑 */
  async addOrUpdateAll(createCurrencyDto: CreateCurrencyDto) {
    return await this.currencyRepository.save(createCurrencyDto)
  }

  /* 分页查询 */
  async list(listCurrencyList: ListCurrencyDto, paginationDto: PaginationDto): Promise<PaginatedDto<Currency>> {
    let where: FindOptionsWhere<Currency> = {}
    let result: any;
    where = {
      ...listCurrencyList,
      status: '1'
    }
    result = await this.currencyRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
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
    return this.currencyRepository.findOneBy({ id })
  }

  findOneByName(name: string) {
    return this.currencyRepository.findOneBy({ symbol: name })
  }

  update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
    return this.currencyRepository.update(id, updateCurrencyDto)
  }

  deleteOne(id: number) {
    return this.currencyRepository.delete(id)
  }

  async delete(ids: number[] | string[]) {
    return this.currencyRepository.delete(ids)
  }
}
