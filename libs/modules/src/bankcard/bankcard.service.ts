import { Inject, Injectable, Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { CreateBankcardDto, ListMyBankcardDto, ListBankcardDto, UpdateBankcardDto, UpdateBankcardStatusDto, CreateBankcardKycDto } from './dto/request-bankcard.dto';
import { Bankcard } from './entities/bankcard.entity';
import { ConfigService } from '@nestjs/config';
import { IdentityService } from '../identity/identity.service';
import { ApiException } from '@app/common/exceptions/api.exception';
import { SharedService } from '@app/shared/shared.service';
import { KycService } from '../kyc/kyc.service';
import { Account } from '../account/entities/account.entity';
import { CardinfoService } from '../cardinfo/cardinfo.service';
import { User } from '../system/user/entities/user.entity';

@Injectable()
export class BankcardService {
  logger = new Logger(BankcardService.name)
  platformAddress: string
  secret: string
  constructor(
    @InjectRepository(Bankcard) private readonly bankcardRepository: Repository<Bankcard>,
    private readonly identityService: IdentityService,
    private readonly kycService: KycService,
    private readonly cardinfoService: CardinfoService,
    private readonly configService: ConfigService,
    private readonly sharedService: SharedService,

  ) {
    this.secret = this.configService.get<string>('platform.secret')
    this.platformAddress = this.configService.get<string>('crichain.platformAddress')
  }

  async create(createBankcardDto: CreateBankcardDto, userId: number) {
    const bgColor = this.sharedService.getBankBgColor(createBankcardDto.bankType)
    createBankcardDto.cardNo = createBankcardDto.cardNo.replace(/\s*/g, "")
    const bankcard = {
      ...createBankcardDto,
      bgColor: bgColor,
    }
    return this.bankcardRepository.save(bankcard)
  }

  async createWithIdentity(createBankcardDto: CreateBankcardDto, userId: number) {
    const identity = await this.identityService.findOneByUser(userId)
    if (identity === null) {
      throw new ApiException('没有实名认证')
    }
    const bgColor = this.sharedService.getBankBgColor(createBankcardDto.bankType)
    createBankcardDto.cardNo = createBankcardDto.cardNo.replace(/\s*/g, "")
    const bankcard = {
      ...createBankcardDto,
      userId,
      bgColor: bgColor,
      identityId: identity.identityId,
    }
    return this.bankcardRepository.save(bankcard)
  }

  async createWithKyc(createBankcardDto: CreateBankcardKycDto, userId: number) {
    const kyc = await this.kycService.findOneByUser(userId)
    if (kyc === null) {
      throw new ApiException('没有KYC认证')
    }

    // const bgColor = this.sharedService.getBankBgColor(createBankcardDto.bankType)
    createBankcardDto.cardNo = createBankcardDto.cardNo.replace(/\s*/g, "")
    const bankcard = {
      ...createBankcardDto,
      userId,
      // bgColor: bgColor,
      kycId: kyc.id,
    }
    this.logger.debug(bankcard.pinCode, this.secret)
    bankcard.pinCode = this.sharedService.aesEncrypt(createBankcardDto.pinCode, this.secret)
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
      relations: { cardinfo: true },
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    // for(let bankcard of result[0]) {
    //   try {
    //     bankcard.balance = await this.fund33Service.queryBalance({cardId: bankcard.id }, userId);
    //   } catch (error) {
        
    //   }
    // }

    return {
      rows: result[0],
      total: result[1]
    }
  }

  async upgrade(id: number, userId: number) {
    const bankcard = await this.bankcardRepository.findOne({where: {id: id}, relations: {cardinfo: true} })
    const updateFee = bankcard.cardinfo.info.upgradeFee
    if(updateFee == 0) {
      throw new ApiException("此卡无需升级")
    }

    const nextCardinfo = await this.cardinfoService.findOneByIndex(bankcard.cardinfo.index + 1)
    if(!nextCardinfo) {
      throw new ApiException("此卡无需升级")
    }
    let updateBankcardDto: UpdateBankcardDto = {
      cardinfoId: nextCardinfo.id
    }
    return await this.bankcardRepository.manager.transaction(async manager => {
      const currencyId = 1
      const account = await manager.findOne(Account, { where: { currencyId, userId, usable: MoreThanOrEqual(updateFee)} })
      if(!account) {
        throw new ApiException('资金不足')
      }

      await manager.decrement(Account, { userId: userId, currencyId }, "usable", updateFee)
      await manager.increment(Account, { userId: 1 }, "usable", updateFee)
            
      await manager.update(Bankcard, { id: bankcard.id }, { cardinfoId: nextCardinfo.id })
      await manager.update(User, {userId: userId}, {vip: nextCardinfo.index})
      return await manager.findOne(Bankcard, {where: {id: bankcard.id}, relations: {cardinfo: true}})
    })

  }

  findFreeOne() {
    return this.bankcardRepository.findOne({ where: { status:'0' }, relations: { user: true, identity: true } })
  }

  findOne(id: number) {
    return this.bankcardRepository.findOne({ where: { id: id }, relations: { user: true, identity: true } })
  }

  async update(id: number, updateBankcardDto: UpdateBankcardDto) {
    return this.bankcardRepository.update(id, updateBankcardDto)
  }

  async updateWithTradeNo(tradeNo: string, tradeTime: string, updateBankcardDto: UpdateBankcardDto) {
    return this.bankcardRepository.update({ signTradeNo: tradeNo, signTradeTime: tradeTime }, updateBankcardDto)
  }

  deleteOne(id: number) {
    return this.bankcardRepository.delete(id)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.bankcardRepository.delete(noticeIdArr)
  }

  async invalidate(id: number, userId: number) {
    let updateBankcardDto: UpdateBankcardDto = {
      status: '2'
    }
    return this.bankcardRepository.update(id, updateBankcardDto)
  }

  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }

}
