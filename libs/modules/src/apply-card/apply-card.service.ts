import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Injectable, Logger } from '@nestjs/common';
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
import { Order } from 'apps/giftcard/src/order/entities/order.entity';
import strRandom from 'string-random';
import { ProfitRecordService } from '../profit_record/profit_record.service';
import { ProfitType } from '../profit_record/entities/profit_record.entity';
import { SYSCONF_OPENCARD_BROKERAGE_KEY } from '@app/common/contants/sysconfig.contants';
import { SysConfigService } from '../system/sys-config/sys-config.service';
import { CreateProfitRecordDto } from '../profit_record/dto/create-profit_record.dto';
import { CreateBrokerageRecordDto } from '../brokerage_record/dto/create-brokerage_record.dto';
import { BrokerageType } from '../brokerage_record/entities/brokerage_record.entity';
import { InviteUser } from '../inviteuser/entities/invite-user.entity';
import { AccountFlow, AccountFlowDirection, AccountFlowType } from '../account/entities/account-flow.entity';
import { Currency } from '../currency/entities/currency.entity';

@Injectable()
export class ApplyCardService {

  logger = new Logger(ApplyCardService.name)

  constructor(
    @InjectRepository(ApplyCard) private readonly applycardRepository: Repository<ApplyCard>,
    private readonly cardInfoService: CardinfoService,
    // private readonly kycService: KycService,
    private readonly currencyService: CurrencyService,
    // private readonly sysconfigService: SysConfigService,
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
    // const kyc = await this.kycService.findOne(createApplyCardDto.kycId)
    // if (kyc === null) {
    //   throw new ApiException('KYC资料不存在')
    // }
    // if (kyc.status != '1') {
    //   throw new ApiException('KYC还没通过审核')
    // }

    const applycardDto = {
      ...createApplyCardDto,
      userId,
    }
    const applycard = await this.applycardRepository.save(applycardDto)

    const currency = await this.currencyService.findOneByName('USDT')
    const order = await this.requestBankcard(userId, currency.id, currency.symbol, cardInfo.id, cardInfo.openFee)

    // KYC是否存在
    // await this.applycardRepository.update(applycard.id, {bankcardId: bankcard.id, status: ApplyCardStatus.ApplySuccess})

    return order
  }

  // request bankcard
  async requestBankcard(userId: number, currencyId: number, currencySymbol: string,cardinfoId:number, openfee: number) {
    // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
    // let openCardBrokerage = 0.0
    // const opencardBrokerageString = await this.sysconfigService.getValue(SYSCONF_OPENCARD_BROKERAGE_KEY)
    // this.logger.debug(opencardBrokerageString || "0.2")
    // openCardBrokerage = Number(opencardBrokerageString)

    // this.logger.debug('marketFee ratio' + openCardBrokerage)
    // if (openCardBrokerage > 1.0 || openCardBrokerage <= 0.0) {
    //   openCardBrokerage = 0.2
    // }

    return await this.applycardRepository.manager.transaction(async manager => {
      const bankcard = await manager.findOne(Bankcard, { where: { status:'0'}, relations: {} })
      const cardInfo = await manager.findOne(Cardinfo, { where: { id: cardinfoId} })
      if(!bankcard) {
        throw new ApiException('银行卡已经申领完')
      }
      if(!cardInfo) {
        throw new ApiException('银行卡类型不正确')
      }
      const inviteUser  = await manager.findOneBy(InviteUser, { id: userId })
      const parentId = inviteUser?.parentId

      const account = await manager.findOne(Account, { where: { currencyId, userId, usable: MoreThanOrEqual(openfee)} })
      if(!account) {
        throw new ApiException('资金不足')
      }

      await manager.decrement(Account, { userId: userId, currencyId }, "usable", openfee)
      await manager.increment(Account, { userId: 1, currencyId}, "usable", openfee)

      // Add Account Flow
      const accountFlow = new AccountFlow()
      accountFlow.type = AccountFlowType.OpenCard
      accountFlow.direction = AccountFlowDirection.Out
      accountFlow.userId = userId
      accountFlow.amount = openfee
      accountFlow.currencyId = currencyId
      accountFlow.currencyName = currencySymbol
      accountFlow.balance = 0
      await manager.save(accountFlow )
            
      // await manager.update(User, {userId: userId}, {vip: cardInfo.index})

      // 创建订单
      const order = new Order()
      order.id = parseInt('1' + strRandom(8, {letters: false}))
      order.status = '5' // 需要kyc审核
      order.userId = userId
      order.userName = ''
      order.assetId = bankcard.id
      order.assetType = '0' // 申请开卡
      order.userPhone = ''
      order.cardNo = bankcard.cardNo
      order.homeAddress = ''
      order.count = 1
      order.currencyId = currencyId
      order.currencySymbol = currencySymbol
      
      order.price = openfee
      order.totalPrice = openfee
      order.tradeFee = 0.0
      order.shipFee = 0.0
      order.desc = cardInfo.name
      order.image = cardInfo.image

      const order2 =  await manager.save(order);

      await manager.update(Bankcard, { id: bankcard.id }, { userId: userId, status: '2', cardinfoId: cardinfoId, order: order2 }) // 锁定银行卡

      return order2

      // openCardBrokerage = order.totalPrice * openCardBrokerage

      // const profitRecordDto: CreateProfitRecordDto ={
      //   type: ProfitType.OpenCardFee,
      //   content: '申请开卡收益',
      //   userId: userId,
      //   amount: order.totalPrice,
      //   fee: order.totalPrice - openCardBrokerage,
      //   txid: 'orderId: ' + order.id
      // }
      // await manager.save(profitRecordDto);

      // if(parentId) {
      //   await manager.increment(Account, { userId: parentId, currencyId: currencyId }, "usable", openCardBrokerage)
      //   await manager.update(InviteUser, {id: userId}, {isOpenCard: true})

      //   const brokerageRecordDto: CreateBrokerageRecordDto ={
      //     type: BrokerageType.OpenCardBrokerage,
      //     content: '申请开卡提成',
      //     userId: parentId,
      //     fromUserId: userId,
      //     amount: order.totalPrice,
      //     value: openCardBrokerage,
      //     txid: 'orderId: ' + order.id
      //   }
      //   await manager.save(profitRecordDto);
      // }
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
