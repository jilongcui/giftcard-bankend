import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { CardinfoService } from '../cardinfo/cardinfo.service';
import { KycService } from '../kyc/kyc.service';
import { CreateApplyCardDto, ListMyApplyCardDto } from './dto/create-apply-card.dto';
import { ListApplyCardDto, UpdateApplyCardDto, UpdateApplyCardStatusDto } from './dto/update-apply-card.dto';
import { ApplyCard, ApplyCardStatus } from './entities/apply-card.entity';
import { Account } from '../account/entities/account.entity';
import { CurrencyService } from '../currency/currency.service';
import { User } from '../system/user/entities/user.entity';
import { Cardinfo } from '../cardinfo/entities/cardinfo.entity';
import { Bankcard } from 'apps/giftcard/src/bankcard/entities/bankcard.entity';

@Injectable()
export class ApplyCardService {

  constructor(
    @InjectRepository(ApplyCard) private readonly applycardRepository: Repository<ApplyCard>,
    private readonly cardInfoService: CardinfoService,
    private readonly kycService: KycService,
    private readonly currencyService: CurrencyService,
  ) {}
  findAll() {
    return `This action returns all applyCard`;
  }

  findOne(id: number) {
    return this.applycardRepository.findOne({ where: { id: id }, relations: { user: true, kyc: true, bankcard: true } })
  }

  update(id: number, updateApplyCardDto: UpdateApplyCardDto) {
    return `This action updates a #${id} applyCard`;
  }

  remove(id: number) {
    return `This action removes a #${id} applyCard`;
  }

  /* 分页查询 */
  async list(listApplyCardList: ListApplyCardDto, paginationDto: PaginationDto): Promise<PaginatedDto<ApplyCard>> {
    let where: FindOptionsWhere<ApplyCard> = {}
    let result: any;
    where = listApplyCardList

    result = await this.applycardRepository.findAndCount({
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
  async mylist(userId: number, listMyApplyCardDto: ListMyApplyCardDto, paginationDto: PaginationDto): Promise<PaginatedDto<ApplyCard>> {
    let where: FindOptionsWhere<ListApplyCardDto> = {}
    let result: any;
    where = {
      ...listMyApplyCardDto,
      userId,
    }

    result = await this.applycardRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { kyc: true, bankcard: true },
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

  async create(createApplyCardDto: CreateApplyCardDto, userId: number) {
    // 读取卡片内容，是否存在
    const cardInfo = await this.cardInfoService.findOne(createApplyCardDto.cardinfoId)
    if (cardInfo === null) {
      throw new ApiException('银行卡类型错误')
    }

    // KYC是否存在
    const kyc = await this.kycService.findOne(createApplyCardDto.kycId)
    if (kyc === null) {
      throw new ApiException('KYC资料不存在')
    }
    if (kyc.status != '1') {
      throw new ApiException('KYC还没通过审核')
    }

    const applycardDto = {
      ...createApplyCardDto,
      userId,
    }
    const applycard = await this.applycardRepository.save(applycardDto)

    const currency = await this.currencyService.findOneByName('USDT')
    const bankcard = await this.requestBankcard(userId, currency.id, cardInfo.id, cardInfo.info.openFee)

    // KYC是否存在
    await this.applycardRepository.update(applycard.id, {bankcardId: bankcard.id, status: ApplyCardStatus.ApplySuccess})

    return bankcard
  }

  // request bankcard
  async requestBankcard(userId: number, currencyId: number, cardinfoId:number, openfee: number) {
    // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
    return await this.applycardRepository.manager.transaction(async manager => {
      const bankcard = await manager.findOne(Bankcard, { where: { status:'0'}, relations: {} })
      const cardInfo = await manager.findOne(Cardinfo, { where: { id: cardinfoId} })
      if(!bankcard) {
        throw new ApiException('银行卡已经申领完')
      }
      if(!cardInfo) {
        throw new ApiException('银行卡类型不正确')
      }
      const account = await manager.findOne(Account, { where: { currencyId, userId, usable: MoreThanOrEqual(openfee)} })
      if(!account) {
        throw new ApiException('资金不足')
      }

      await manager.decrement(Account, { userId: userId, currencyId }, "usable", openfee)
      await manager.increment(Account, { userId: 1 }, "usable", openfee)
            
      await manager.update(Bankcard, { id: bankcard.id }, { userId: userId, status: '2', cardinfoId: cardinfoId }) // 锁定银行卡
      // await manager.update(User, {userId: userId}, {vip: cardInfo.index})
      return await manager.findOneBy(Bankcard, {id: bankcard.id})
    })
  }

  deleteOne(id: number) {
    return this.applycardRepository.delete(id)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.applycardRepository.delete(noticeIdArr)
  }

  // /* Kyc验证成功 */
  // async kycCertified(id:number, userId: number) {
  //   let updateApplyCardDto: UpdateApplyCardDto = {
  //     status: ApplyCardStatus.KycCertified
  //   }
  //   return this.applycardRepository.update(id, updateApplyCardDto)
  // }

  // /* 申请成功 */
  // async applySuccess(id:number, bankcardId:number, userId: number) {
  //   let updateApplyCardDto: UpdateApplyCardDto = {
  //     status: ApplyCardStatus.ApplySuccess,
  //     bankcardId: bankcardId
  //   }
  //   return this.applycardRepository.update(id, updateApplyCardDto)
  // }

  // /* KYC失败 */
  // async kycCertifyFailed(id:number, userId: number) {
  //   let updateApplyCardDto: UpdateApplyCardDto = {
  //     status: ApplyCardStatus.KycFailed
  //   }
  //   return this.applycardRepository.update(id, updateApplyCardDto)
  // }

  // /* 申请失败 */
  // async applyFailed(id:number, userId: number) {
  //   let updateApplyCardDto: UpdateApplyCardDto = {
  //     status: ApplyCardStatus.KycFailed
  //   }
  //   return this.applycardRepository.update(id, updateApplyCardDto)
  // }
}
