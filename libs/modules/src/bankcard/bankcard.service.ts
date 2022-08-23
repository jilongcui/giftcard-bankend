import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Inject, Injectable, Logger, ParseArrayPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { COLLECTION_ORDER_COUNT, ACTIVITY_ORDER_TEMPLATE_KEY, COLLECTION_ORDER_SUPPLY, ACTIVITY_START_TIME, ACTIVITY_PRESTART_TIME, ACTIVITY_USER_ORDER_KEY, ASSET_ORDER_KEY } from '@app/common/contants/redis.contant';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Repository, FindOptionsWhere, EntityManager, getManager, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { Activity } from '../activity/entities/activity.entity';
import { PreemptionWhitelist } from '../assistant/preemption/entities/preemptionWhitelist.entity';
import { CreateAssetDto } from '../collection/dto/request-asset.dto';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { CreateBankcardDto, ListMyBankcardDto, ListBankcardDto, UpdateBankcardDto, UpdateBankcardStatusDto } from './dto/request-bankcard.dto';
import { Bankcard } from './entities/bankcard.entity';
import { ClientProxy } from '@nestjs/microservices';
import { MintADto } from '@app/chain';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BankcardService {
  logger = new Logger(BankcardService.name)
  platformAddress: string
  constructor(
    @InjectRepository(Bankcard) private readonly bankcardRepository: Repository<Bankcard>,
    // @InjectRedis() private readonly redis: Redis,
    // @Inject('CHAIN_SERVICE') private client: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.platformAddress = this.configService.get<string>('crichain.platformAddress')
  }

  async create(createBankcardDto: CreateBankcardDto, userId: number) {
    const bankcard = {
      ...createBankcardDto,
      userId
    }
    return this.bankcardRepository.save(bankcard)
  }

  /* 新增或编辑 */
  async addOrUpdateAll(createBankcardDto: CreateBankcardDto) {
    return await this.bankcardRepository.save(createBankcardDto)
  }

  /* 分页查询 */
  async list(listBankcardList: ListBankcardDto, paginationDto: PaginationDto): Promise<PaginatedDto<Bankcard>> {
    let where: FindOptionsWhere<Bankcard> = {}
    let result: any;
    where = listBankcardList

    result = await this.bankcardRepository.findAndCount({
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

  /* 我的订单查询 */
  async mylist(userId: number, listMyBankcardDto: ListMyBankcardDto, paginationDto: PaginationDto): Promise<PaginatedDto<Bankcard>> {
    let where: FindOptionsWhere<ListBankcardDto> = {}
    let result: any;
    where = {
      ...listMyBankcardDto,
      userId,
    }

    result = await this.bankcardRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: ["activity", "collections"],
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
    return this.bankcardRepository.findOne({ where: { id }, relations: { user: true, } })
  }

  update(id: number, updateBankcardDto: UpdateBankcardDto) {
    return this.bankcardRepository.update(id, updateBankcardDto)
  }

  deleteOne(id: number) {
    return this.bankcardRepository.delete(id)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.bankcardRepository.delete(noticeIdArr)
  }

  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }

}
