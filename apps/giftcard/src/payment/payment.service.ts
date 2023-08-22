import { ApiException } from '@app/common/exceptions/api.exception';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { Payment } from './entities/payment.entity';
import { EntityManager, In, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedService } from '@app/shared';

import { ReqWeixinPaymentNotifyDto, WeixinPayForMemberDto, WeixinPaymentNotify, WeixinPayType } from './dto/request-payment.dto';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { SYSCONF_OPENCARD_BROKERAGE_KEY, SYSCONF_MARKET_FEE_KEY } from '@app/common/contants/sysconfig.contants';
import { BankcardService } from '../bankcard/bankcard.service';
import { SysConfigService } from '@app/modules/system/sys-config/sys-config.service';
import { Account } from '@app/modules/account/entities/account.entity';
import { Order } from '../order/entities/order.entity';
import { Bankcard } from '../bankcard/entities/bankcard.entity';
import { Giftcard } from '../giftcard/entities/giftcard.entity';
import { OrderService } from '../order/order.service';
import { InviteUser } from '@app/modules/inviteuser/entities/invite-user.entity';

const NodeRSA = require('node-rsa');
var key = new NodeRSA({
  // encryptionScheme: 'pkcs1', // Here is ignored after importing the key
  ENVIRONMENT: 'node',
});
var key2 = new NodeRSA({
  ENVIRONMENT: 'node',
});
@Injectable()
export class PaymentService {
  logger = new Logger(PaymentService.name)
  baseUrl: string
  platformPublicKey: string
  merchSecretKey: string
  merchPublicKey: string
  merchId: string
  orderSN: string
  platformAddress: string
  notifyHost: string
  weixinNotifyHost: string
  weixinMerchId: string
  weixinXcxAppId: string
  weixinGzhAppId: string
  weixinApi3Key: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly bankcardService: BankcardService,
    private readonly orderService: OrderService,
    private readonly sharedService: SharedService,
    private readonly sysconfigService: SysConfigService,

    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Bankcard) private readonly bankcardRepository: Repository<Bankcard>,
    @InjectRepository(Giftcard) private readonly giftcardRepository: Repository<Giftcard>,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(InviteUser) private readonly inviteUesrRepository: Repository<InviteUser>,
    @InjectRedis() private readonly redis: Redis,
  ) {
    this.baseUrl = this.configService.get<string>('payment.baseUrl')
    this.notifyHost = this.configService.get<string>('payment.notifyHost')
    this.merchId = this.configService.get<string>('payment.merchId')
    this.orderSN = this.configService.get<string>('payment.orderSN')
    this.weixinXcxAppId = this.configService.get<string>('weixinPayment.xcxAppId')
    this.weixinGzhAppId = this.configService.get<string>('weixinPayment.gzhAppId')
    this.weixinMerchId = this.configService.get<string>('weixinPayment.merchId')
    this.weixinApi3Key = this.configService.get<string>('weixinPayment.api3Key')
    this.weixinNotifyHost = this.configService.get<string>('weixinPayment.notifyHost')

    this.platformPublicKey = this.sharedService.getPublicPemFromString(this.configService.get<string>('payment.platformPublicKey'))
    this.merchSecretKey = this.sharedService.getPrivateFromString(this.configService.get<string>('payment.merchSecretKey'))
    this.merchPublicKey = this.sharedService.getPublicPemFromString(this.configService.get<string>('payment.merchPublicKey'))
    this.logger.debug(this.merchId)
    this.platformAddress = this.configService.get<string>('crichain.platformAddress')

    this.logger.debug(this.platformPublicKey)

    key.importKey(this.platformPublicKey, 'pkcs8-public');
    key.setOptions({ encryptionScheme: 'pkcs1' });
    key.setOptions({
      signingScheme: {
        hash: 'sha1',
      },
    })
    key2.importKey(this.merchSecretKey, 'pkcs8-private');
    key2.setOptions({ encryptionScheme: 'pkcs1' });

    if(this.weixinApi3Key) {
    }
  }

  async redisAtomicLpop(countKey: string, count: number) {
    const watchError = await this.redis.watch(countKey)
    if (watchError !== 'OK') throw new ApiException(watchError)
    this.logger.debug(countKey)
    const [execResult] = await this.redis.multi().lpop(countKey, count).exec()
    if (execResult[0] !== null) {
      this.logger.debug('Redis Atomic Decr retry.')
      this.redisAtomicLpop(countKey, count)
    }
    this.logger.debug(execResult[1])
    return execResult[1] // result
  }

  async payWithBalance(id: number, userId: number) {
    const order = await this.orderRepository.findOne({ where: { id: id, status: '1', userId: userId }, relations: { user: true } })
    if (order == null) {
      throw new ApiException('订单状态错误')
    }
    let asset: Bankcard | Giftcard

    if (order.assetType === '0') { // 实名商品
      asset = await this.bankcardRepository.findOne({ where: { id: order.assetId }, relations: { user: true } })
      if (asset.status !== '2')
        throw new ApiException("商品状态不对")
    } else if (order.assetType === '1') { // 非实名商品
      asset = await this.giftcardRepository.findOne({ where: { id: order.assetId }, relations: { user: true } })
      // if (asset.status !== '2')
        // throw new ApiException("商品状态不对")
    }
    const currencyId = order.currencyId
    let openCardProfit = 0.0
    let parentId = null
    await this.orderRepository.manager.transaction(async manager => {
      const result = await manager.decrement(Account, { userId: userId, currencyId: currencyId, usable: MoreThanOrEqual(order.totalPrice) }, "usable", order.totalPrice);
      // this.logger.log(JSON.stringify(result));
      if (!result.affected) {
        throw new ApiException('支付失败')
      }
      order.status = '2';
      // 把Order的状态改成2: 已支付
      await manager.update(Order, { id: order.id }, { status: '2' })
      const ownerId = asset.userId
      if (order.assetType === '0') { // 实名商品
        const opencardProfitString = await this.sysconfigService.getValue(SYSCONF_OPENCARD_BROKERAGE_KEY)
        this.logger.debug(opencardProfitString || "0.2")
        openCardProfit = Number(opencardProfitString)

        this.logger.debug('marketFee ' + openCardProfit)
        if (openCardProfit > 1.0 || openCardProfit <= 0.0) {
          openCardProfit = 0.2
        }
        openCardProfit = order.totalPrice * openCardProfit
      }

      
      const inviteUser  = await manager.findOneBy(InviteUser, { id: userId })
      parentId = inviteUser?.parentId
      await manager.increment(Account, { userId: 1, currencyId: currencyId }, "usable", order.totalPrice - openCardProfit)
      
      if(parentId) {
        await manager.increment(Account, { userId: parentId, currencyId: currencyId }, "usable", openCardProfit)
        await manager.update(InviteUser, {id: userId}, {isOpenCard: true})
      }

      if (order.assetType === '0') { // Bankcard
        await manager.update(Bankcard, { id: asset.id }, { status: '1' })
      } else if (order.assetType === '1') { // Giftcard
        await manager.update(Giftcard, { id: asset.id }, { status: '3' })
      }
    })
    
    return order;
  }

  private randomTradeNo(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }

  // private async buyAssetRecord(asset: Bankcard, userId: number, nickName: string) {

  //   const fromId = asset.user.userId
  //   const fromName = asset.user.nickName

  //   await this.assetRecordRepository.save({
  //     type: '2', // Buy
  //     assetId: asset.id,
  //     price: asset.price,
  //     fromId: fromId,
  //     fromName: fromName,
  //     toId: userId,
  //     toName: nickName
  //   })
  // }

  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }
}
//