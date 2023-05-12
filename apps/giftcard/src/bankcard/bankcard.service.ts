import { Inject, Injectable, Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere, MoreThanOrEqual, Not, IsNull } from 'typeorm';
import { CreateBankcardDto, ListMyBankcardDto, ListBankcardDto, UpdateBankcardDto, UpdateBankcardStatusDto, CreateBankcardKycDto } from './dto/request-bankcard.dto';
import { Bankcard } from './entities/bankcard.entity';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '@app/common/exceptions/api.exception';
import { SharedService } from '@app/shared/shared.service';
import { CardinfoService } from '@app/modules/cardinfo/cardinfo.service';
import { Kyc } from '@app/modules/kyc/entities/kyc.entity';
import { Account } from '@app/modules/account/entities/account.entity';
import { User } from '@app/modules/system/user/entities/user.entity';
import { AccountFlow, AccountFlowDirection, AccountFlowType } from '@app/modules/account/entities/account-flow.entity';
import { Currency } from '@app/modules/currency/entities/currency.entity';

@Injectable()
export class BankcardService {
  logger = new Logger(BankcardService.name)
  platformAddress: string
  secret: string
  constructor(
    @InjectRepository(Bankcard) private readonly bankcardRepository: Repository<Bankcard>,
    @InjectRepository(Kyc) private readonly kycRepository: Repository<Kyc>,
    private readonly cardinfoService: CardinfoService,
    private readonly configService: ConfigService,
    private readonly sharedService: SharedService,

  ) {
    this.secret = this.configService.get<string>('platform.secret')
    this.platformAddress = this.configService.get<string>('crichain.platformAddress')
  }

  async create(createBankcardDto: CreateBankcardDto, userId: number) {
    createBankcardDto.cardNo = createBankcardDto.cardNo.replace(/\s*/g, "")
    const bankcard = {
      ...createBankcardDto,
    }
    return this.bankcardRepository.save(bankcard)
  }

  async createWithKyc(createBankcardDto: CreateBankcardKycDto, userId: number) {
    const kyc = await this.kycRepository.findOneBy({userId})
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

  /* 分页查询 */
  async listWithUser(listBankcardList: ListBankcardDto, paginationDto: PaginationDto): Promise<PaginatedDto<Bankcard>> {
    let where: FindOptionsWhere<Bankcard> = {}
    let result: any;
    where = listBankcardList
    where.status = Not('0')
    where.userId = Not(null)

    result = await this.bankcardRepository.findAndCount({
      where,
      relations: { user: true, kyc: true},
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
      // status: '1',
      ...listMyBankcardDto,
      userId,
    }

    result = await this.bankcardRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { cardinfo: true, kyc: true},
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
      const currency = await manager.findOne(Currency, { where: { id: currencyId} })
      if(!account) {
        throw new ApiException('资金不足')
      }

      const updateResult = await manager.decrement(Account, { userId: userId, currencyId }, "usable", updateFee)
      this.logger.debug(updateResult)
      await manager.increment(Account, { userId: 1 }, "usable", updateFee)
      // Add Account Flow
      const accountFlow = new AccountFlow()
      accountFlow.type = AccountFlowType.UpgradeCard
      accountFlow.direction = AccountFlowDirection.Out
      accountFlow.userId = userId
      accountFlow.amount = updateFee
      accountFlow.currencyId = currencyId
      accountFlow.currencyName = currency.symbol
      accountFlow.balance = 0

      await manager.save(accountFlow )

      await manager.update(Bankcard, { id: bankcard.id }, { cardinfoId: nextCardinfo.id })
      await manager.update(User, {userId: userId}, {vip: nextCardinfo.index})
      return await manager.findOne(Bankcard, {where: {id: bankcard.id}, relations: {cardinfo: true}})
    })

  }

  findFreeOne() {
    return this.bankcardRepository.findOne({ where: { status:'0' }, relations: { user: true} })
  }

  findOne(id: number) {
    return this.bankcardRepository.findOne({ where: { id: id }, relations: { user: true, order: true} })
  }

  async update(id: number, updateBankcardDto: UpdateBankcardDto) {
    return this.bankcardRepository.update(id, updateBankcardDto)
  }

  // async updateWithTradeNo(tradeNo: string, tradeTime: string, updateBankcardDto: UpdateBankcardDto) {
  //   return this.bankcardRepository.update({ signTradeNo: tradeNo, signTradeTime: tradeTime }, updateBankcardDto)
  // }

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

  /* 导入批量插入用户 */
  async insert(data: any) {
    let bankcardArr: Bankcard[] = []
    for await (const iterator of data) {
        let bankcard = new Bankcard()
        if (!iterator.cardNo || !iterator.bankName) throw new ApiException('银行卡卡号、银行名称')
        const one = await this.bankcardRepository.findOneBy({cardNo: iterator.cardNo})
        if (one) throw new ApiException('该银行卡已存在')
        bankcard = Object.assign(bankcard, iterator)
        bankcardArr.push(bankcard)
    }
    await this.bankcardRepository.createQueryBuilder()
        .insert()
        .into(Bankcard)
        .values(bankcardArr)
        .execute()
  }
}
