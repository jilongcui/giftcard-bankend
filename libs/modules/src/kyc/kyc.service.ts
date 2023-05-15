import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { CreateKycDto, CreateKycInfoDto, ListKycDto, ListMyKycDto } from './dto/create-kyc.dto';
import { NotifyKycStatusDto, UpdateKycDto, UpdateKycStatusDto } from './dto/update-kyc.dto';
import { Kyc, KycCertifyInfo } from './entities/kyc.entity';
import { Fund33Service } from '../fund33/fund33.service';
import { SharedService } from '@app/shared';
import { ConfigService } from '@nestjs/config';
import { Bankcard } from 'apps/giftcard/src/bankcard/entities/bankcard.entity';
import { User } from '../system/user/entities/user.entity';
import { Order } from 'apps/giftcard/src/order/entities/order.entity';
import { Account } from '../account/entities/account.entity';
import { ProfitRecord, ProfitType } from '../profit_record/entities/profit_record.entity';
import { BrokerageRecord, BrokerageType } from '../brokerage_record/entities/brokerage_record.entity';
import { InviteUser } from '../inviteuser/entities/invite-user.entity';
import { SysConfigService } from '../system/sys-config/sys-config.service';
import { SYSCONF_OPENCARD_BROKERAGE_KEY, SYSCONF_OPENCARD_HIGH_BROKERAGE_KEY } from '@app/common/contants/sysconfig.contants';
import { AccountFlow, AccountFlowType, AccountFlowDirection } from '../account/entities/account-flow.entity';

@Injectable()
export class KycService {
  logger = new Logger(KycService.name)
  notifyUrl: string
  constructor(
    @InjectRepository(Kyc) private readonly kycRepository: Repository<Kyc>,
    @InjectRepository(Bankcard) private readonly bankcardRepository: Repository<Bankcard>,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    private readonly sharedService: SharedService,
    private readonly configService: ConfigService,
    private readonly fund33Service: Fund33Service,
    private readonly sysconfigService: SysConfigService,
  ) {
    this.notifyUrl = this.configService.get<string>('kyc.notifyUrl')
  }

  async create(createKycInfoDto: CreateKycInfoDto, userId: number) {
    const kyc = await this.kycRepository.findOneBy({userId})
    if(kyc && kyc.status == '1') {
      throw new ApiException("已存在KYC")
    }
    const order = await this.orderRepository.findOneBy({id: Number(createKycInfoDto.merOrderNo)})
    // createKycInfoDto.sourceOfFunds =JSON.stringify(createKycInfoDto.sourceOfFunds)
    // createKycInfoDto.industry =JSON.stringify(createKycInfoDto.industry)
    // createKycInfoDto.jobPosition =JSON.stringify(createKycInfoDto.jobPosition)
    // createKycInfoDto.intended =JSON.stringify(createKycInfoDto.intended)
    // createKycInfoDto.purposeOfUse =JSON.stringify(createKycInfoDto.purposeOfUse)
    const kycDto: CreateKycDto = {
      id: kyc?.id,
      status: '0',
      info: {...createKycInfoDto},
      cardType: createKycInfoDto.certType,
      cardNo: order.remark,
      signNo: '',
      failReason: '',
      orderNo: createKycInfoDto.merOrderNo,
      userId: userId
    }
    
    // this.logger.debug(kycDto)
    // kycDto.info.merOrderNo = kycDto.orderNo
    kycDto.info.notifyUrl = this.notifyUrl

    await this.fund33Service.uploadKycInfo(kycDto.info)

    const kyc2 = await this.kycRepository.save(kycDto)
    await this.bankcardRepository.update(order.assetId, {kycId: kyc2.id})
    await this.orderRepository.update(order.id, {status: '6'})
    return kyc2
  }

  async findOne(id: number) {
    return this.kycRepository.findOneBy({ id })
  }

  async findOneByUser(userId: number) {
    return this.kycRepository.findOneBy({userId})
  }

  async findOneByOrderNo(orderNo: string) {
    return this.kycRepository.findOneBy({orderNo, status: '0'})
  }

  async notify(notifyKycDto: NotifyKycStatusDto) {
    this.logger.debug(`notify: ` + JSON.stringify(notifyKycDto))
    const kyc = await this.kycRepository.findOneBy({orderNo: notifyKycDto.merOrderNo, status: '0'})
    if(!kyc) {
      throw new ApiException("KYC状态不对")
    }
    const order = await this.orderRepository.findOneBy({id: Number(notifyKycDto.merOrderNo)})
    if(notifyKycDto.status === '1') kyc.status = '0'
    if(notifyKycDto.status === '2') kyc.status = '1'
    if(notifyKycDto.status === '3') kyc.status = '2'
    if(notifyKycDto.status === '2') { //  Success
      await this.bankcardRepository.manager.transaction(async manager => {
        const userId = order.userId
        const bankcard = await manager.findOne(Bankcard, {where:{cardNo: kyc.cardNo, status: '2'}, relations: {cardinfo: true}})
        if(!bankcard) {
          throw new ApiException("未发现KYC绑定的卡")
        }
        
        await manager.update(Bankcard, { id: bankcard.id }, { status: '1' }) // 激活银行卡
        await manager.update(Order, { id: order.id }, { status: '2' }) // 待发货.
        const user = await manager.findOneBy(User, {userId: bankcard.userId})
        if(user.vip < bankcard.cardinfo.index) {
          await manager.update(User, {userId: bankcard.userId}, {vip: bankcard.cardinfo.index})
        }
        const inviteUser  = await manager.findOneBy(InviteUser, { id: userId })
        
        const parentId = inviteUser?.parentId
        let openCardBrokerage = 0.0

        if(parentId) {
          // 增加收益
          const parent = await manager.findOneBy(User, {userId: inviteUser.parentId})
          if(parent.promotionAgentId) { // Promotion Agent
            const opencardBrokerageString = await this.sysconfigService.getValue(SYSCONF_OPENCARD_HIGH_BROKERAGE_KEY)
            this.logger.debug(opencardBrokerageString || "0.5")
            openCardBrokerage = Number(opencardBrokerageString)
          } else {
            const opencardBrokerageString = await this.sysconfigService.getValue(SYSCONF_OPENCARD_BROKERAGE_KEY)
            this.logger.debug(opencardBrokerageString || "0.2")
            openCardBrokerage = Number(opencardBrokerageString)
          }
          
          this.logger.debug('marketFee ratio' + openCardBrokerage)

          openCardBrokerage = order.totalPrice * openCardBrokerage
        }

        const profitRecordDto = new ProfitRecord()
        profitRecordDto.type = ProfitType.OpenCardFee
        profitRecordDto.content = '开卡平台收益',
        profitRecordDto.userId = userId,
        profitRecordDto.amount = order.totalPrice,
        profitRecordDto.fee = order.totalPrice - openCardBrokerage,
        profitRecordDto.txid = 'orderId: ' + order.id
        await manager.save(profitRecordDto);
        // await this.profitRecordService.create(profitRecordDto)
  
        
        const currencyId = order.currencyId
        const currencySymbol = order.currencySymbol
        if(parentId) {
          await manager.increment(Account, { userId: parentId, currencyId: currencyId }, "usable", openCardBrokerage)
          await manager.update(InviteUser, {id: userId}, {isOpenCard: true})
  
          const accountFlow = new AccountFlow()
          accountFlow.type = AccountFlowType.OpenCardBrokerage
          accountFlow.direction = AccountFlowDirection.In
          accountFlow.userId = parentId
          accountFlow.amount = openCardBrokerage
          accountFlow.currencyId = currencyId
          accountFlow.currencyName = currencySymbol
          accountFlow.balance = 0
          await manager.save(accountFlow)

          const brokerageRecordDto = new BrokerageRecord()
          brokerageRecordDto.type = BrokerageType.OpenCardBrokerage,
          brokerageRecordDto.content = '申请开卡返佣',
          brokerageRecordDto.userId = parentId,
          brokerageRecordDto.fromUserId = userId,
          brokerageRecordDto.amount = order.totalPrice,
          brokerageRecordDto.value = openCardBrokerage,
          brokerageRecordDto.txid = 'orderId: ' + order.id
          await manager.save(profitRecordDto);
        }
      })
      kyc.signNo = notifyKycDto.orderNo
      await this.kycRepository.save(kyc)
    }
    else if(notifyKycDto.status === '3') { //  Fail
      kyc.failReason = notifyKycDto.failReason
      await this.bankcardRepository.manager.transaction(async manager => {
        const bankcard = await manager.findOneBy(Bankcard, {cardNo: kyc.cardNo, status: '2'})
        if(!bankcard) {
          throw new ApiException("未发现KYC绑定的卡")
        }
        const order = await manager.findOneBy(Order, {assetId: bankcard.id})

        await manager.update(Bankcard, { id: bankcard.id }, { userId: null, status: '0' }) // 释放银行卡
        await manager.update(Order, { id: order.id }, { status: '7' }) // fail
        // 释放定金
        const currencyId = order.currencyId
        const currencySymbol = order.currencySymbol
        const openfee = order.price
        await manager.increment(Account, { userId: order.userId, currencyId }, "usable", openfee)
        const accountFlow = new AccountFlow()
        accountFlow.type = AccountFlowType.OpenCardRevert
        accountFlow.direction = AccountFlowDirection.In
        accountFlow.userId = order.userId
        accountFlow.amount = openfee
        accountFlow.currencyId = currencyId
        accountFlow.currencyName = currencySymbol
        accountFlow.balance = 0
        await manager.save(accountFlow)
      })
      kyc.signNo = notifyKycDto.orderNo
      await this.kycRepository.save(kyc)
    }
    
    return 'ok'
  }

  update(id: number, updateKycDto: UpdateKycDto, userId: number) {
    const kyc = this.kycRepository.findOneBy({id: id, userId: userId})
    if (!kyc)
      throw new ApiException("非此用户的KYC")
    return this.kycRepository.update(id, updateKycDto)
  }

  updateStatus(id: number, updateKycDto: UpdateKycStatusDto, userId: number) {
    const kyc = this.kycRepository.findOneBy({id: id, userId: userId})
    if (!kyc)
      throw new ApiException("非此用户的KYC")
    return this.kycRepository.update(id, updateKycDto)
  }

  remove(id: number) {
    return this.kycRepository.delete(id)
  }

  /* 分页查询 */
  async list(listKycList: ListKycDto, paginationDto: PaginationDto): Promise<PaginatedDto<Kyc>> {
    let where: FindOptionsWhere<ListKycDto> = {}
    let result: any;
    where = listKycList

    result = await this.kycRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
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
  async mylist(userId: number, listMyKycDto: ListMyKycDto, paginationDto: PaginationDto): Promise<PaginatedDto<Kyc>> {
    let where: FindOptionsWhere<ListKycDto> = {}
    let result: any;
    where = {
      ...listMyKycDto,
      userId,
    }

    result = await this.kycRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: ["user"],
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
