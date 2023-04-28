import { Inject, Injectable, Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { CreateGiftcardDto, ListMyGiftcardDto, ListGiftcardDto, UpdateGiftcardDto, UpdateGiftcardStatusDto, CreateGiftcardKycDto } from './dto/request-giftcard.dto';
import { Giftcard } from './entities/giftcard.entity';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '@app/common/exceptions/api.exception';
import { SharedService } from '@app/shared/shared.service';
import { CardinfoService } from '@app/modules/cardinfo/cardinfo.service';
import { Kyc } from '@app/modules/kyc/entities/kyc.entity';
import { Account } from '@app/modules/account/entities/account.entity';
import { User } from '@app/modules/system/user/entities/user.entity';

@Injectable()
export class GiftcardService {
  logger = new Logger(GiftcardService.name)
  platformAddress: string
  secret: string
  constructor(
    @InjectRepository(Giftcard) private readonly giftcardRepository: Repository<Giftcard>,
    @InjectRepository(Giftcard) private readonly kycRepository: Repository<Kyc>,
    private readonly cardinfoService: CardinfoService,
    private readonly configService: ConfigService,
    private readonly sharedService: SharedService,

  ) {
    this.secret = this.configService.get<string>('platform.secret')
    this.platformAddress = this.configService.get<string>('crichain.platformAddress')
  }

  async create(createGiftcardDto: CreateGiftcardDto, userId: number) {
    createGiftcardDto.cardNo = createGiftcardDto.cardNo.replace(/\s*/g, "")
    const giftcard = {
      ...createGiftcardDto,
    }
    return this.giftcardRepository.save(giftcard)
  }

  /* 新增或编辑 */
  async addOrUpdateAll(createGiftcardDto: CreateGiftcardDto) {
    return await this.giftcardRepository.save(createGiftcardDto)
  }

  /* 分页查询 */
  async list(listGiftcardList: ListGiftcardDto, paginationDto: PaginationDto): Promise<PaginatedDto<Giftcard>> {
    let where: FindOptionsWhere<Giftcard> = {}
    let result: any;
    where = listGiftcardList

    result = await this.giftcardRepository.findAndCount({
      where,
      relations: { cardinfo: true },
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
  async listWithUser(listGiftcardList: ListGiftcardDto, paginationDto: PaginationDto): Promise<PaginatedDto<Giftcard>> {
    let where: FindOptionsWhere<Giftcard> = {}
    let result: any;
    where = listGiftcardList

    result = await this.giftcardRepository.findAndCount({
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
  async mylist(userId: number, listMyGiftcardDto: ListMyGiftcardDto, paginationDto: PaginationDto): Promise<PaginatedDto<Giftcard>> {
    let where: FindOptionsWhere<ListGiftcardDto> = {}
    let result: any;
    where = {
      ...listMyGiftcardDto,
      userId,
    }

    result = await this.giftcardRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { cardinfo: true },
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    // for(let giftcard of result[0]) {
    //   try {
    //     giftcard.balance = await this.fund33Service.queryBalance({cardId: giftcard.id }, userId);
    //   } catch (error) {
        
    //   }
    // }

    return {
      rows: result[0],
      total: result[1]
    }
  }

  async upgrade(id: number, userId: number) {
    const giftcard = await this.giftcardRepository.findOne({where: {id: id}, relations: {cardinfo: true} })
    const updateFee = giftcard.cardinfo.info.upgradeFee
    if(updateFee == 0) {
      throw new ApiException("此卡无需升级")
    }

    const nextCardinfo = await this.cardinfoService.findOneByIndex(giftcard.cardinfo.index + 1)
    if(!nextCardinfo) {
      throw new ApiException("此卡无需升级")
    }
    let updateGiftcardDto: UpdateGiftcardDto = {
      cardinfoId: nextCardinfo.id
    }
    return await this.giftcardRepository.manager.transaction(async manager => {
      const currencyId = 1
      const account = await manager.findOne(Account, { where: { currencyId, userId, usable: MoreThanOrEqual(updateFee)} })
      if(!account) {
        throw new ApiException('资金不足')
      }

      await manager.decrement(Account, { userId: userId, currencyId }, "usable", updateFee)
      await manager.increment(Account, { userId: 1 }, "usable", updateFee)
            
      await manager.update(Giftcard, { id: giftcard.id }, { cardinfoId: nextCardinfo.id })
      await manager.update(User, {userId: userId}, {vip: nextCardinfo.index})
      return await manager.findOne(Giftcard, {where: {id: giftcard.id}, relations: {cardinfo: true}})
    })

  }

  findFreeOne() {
    return this.giftcardRepository.findOne({ where: { status:'0' }, relations: { user: true} })
  }

  findOne(id: number) {
    return this.giftcardRepository.findOne({ where: { id: id }, relations: { user: true} })
  }

  async update(id: number, updateGiftcardDto: UpdateGiftcardDto) {
    return this.giftcardRepository.update(id, updateGiftcardDto)
  }

  // async updateWithTradeNo(tradeNo: string, tradeTime: string, updateGiftcardDto: UpdateGiftcardDto) {
  //   return this.giftcardRepository.update({ signTradeNo: tradeNo, signTradeTime: tradeTime }, updateGiftcardDto)
  // }

  deleteOne(id: number) {
    return this.giftcardRepository.delete(id)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.giftcardRepository.delete(noticeIdArr)
  }

  async invalidate(id: number, userId: number) {
    let updateGiftcardDto: UpdateGiftcardDto = {
      status: '2'
    }
    return this.giftcardRepository.update(id, updateGiftcardDto)
  }

  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }

}
