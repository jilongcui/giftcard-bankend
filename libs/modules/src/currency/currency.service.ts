import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateCurrencyDto, ListCurrencyDto, UpdateCurrencyDto, UpdateRatioDto } from './dto/request-currency.dto';
import { Currency } from './entities/currency.entity';
import { HttpService } from '@nestjs/axios';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { CURRENCY_UPDATE_KEY } from '@app/common/contants/redis.contant';

@Injectable()
export class CurrencyService {
  logger = new Logger(CurrencyService.name)

  constructor(
    @InjectRepository(Currency) private readonly currencyRepository: Repository<Currency>,
    private readonly httpService: HttpService,
    @InjectRedis() private readonly redis: Redis
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

    this.updateExchangeRatio()

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
        id: 'ASC',
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

  async updateRatio(name: string, updateUsdtDto: UpdateRatioDto) {
    const currency = await this.findOneByName(name.toUpperCase())
    return this.currencyRepository.update(currency.id, updateUsdtDto)
  }

  deleteOne(id: number) {
    return this.currencyRepository.delete(id)
  }

  async delete(ids: number[] | string[]) {
    return this.currencyRepository.delete(ids)
  }

  async updateExchangeRatio() {

    const exist = await this.redis.get(CURRENCY_UPDATE_KEY)
    if(exist) {
      return
    }

    // Exchange ratio
    let options = {
        headers: {
            "Content-Type": "; charset=gb2312"
        }
        // params: body
    }
    const remoteUrl = 'https://otc.onesatoshi.world/SPP/api/quote_v3.php'
    this.logger.debug(remoteUrl)
    // let res = await axios.get(remoteUrl);
    let res = await this.httpService.axiosRef.get(remoteUrl, options);
    const responseData = res.data
    // this.logger.debug(responseData)

    const actionArray = responseData.action
    const cryptoTypeArray = responseData.crypto_type
    const priceArray = responseData.price

    if(actionArray.length > 0)
      await this.redis.set(CURRENCY_UPDATE_KEY, '1', 'EX', 60 * 60 * 1)

    for(let i=0; i< actionArray.length; i++) {
      const names = cryptoTypeArray[i].toUpperCase().split('_')
      if(names.length != 2) {
        // this.logger.error("汇率获取失败: ", cryptoTypeArray[i])
        continue
      }
      const currency = await this.findOneByName(names[0])
      if(!currency) continue

      if(actionArray[i] == 'sell') {
        // Sell HKD Exchange Ratio
        // Equal to we Buy HKD Ratio
        const newRatio = priceArray[i]
        if(Math.abs(newRatio - currency.sell_exratio) / currency.sell_exratio > 0.2) {
          this.logger.error(`汇率变动机场: new Ratio: ${newRatio} old Ratio ${currency.sell_exratio}`)
          // continue
        } else
          currency.sell_exratio = newRatio
      }

      if(actionArray[i] == 'buy') {
        // Buy Exchange Ratio
        const newRatio = priceArray[i]
        if(Math.abs(newRatio - currency.buy_exratio) / currency.buy_exratio > 0.2) {
          this.logger.error(`汇率变动机场: new Ratio: ${newRatio} old Ratio ${currency.buy_exratio}`)
          // continue
        } else
          currency.buy_exratio = newRatio
      }
      
      await this.currencyRepository.save(currency)
    }
  }
}
