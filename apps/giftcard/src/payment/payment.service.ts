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
import WxPay from 'wechatpay-node-v3';
import { WECHAT_PAY_MANAGER } from 'nest-wechatpay-node-v3';
import { Ijsapi, Inative } from 'wechatpay-node-v3/dist/lib/interface';
import { BankcardService } from '../bankcard/bankcard.service';
import { SysConfigService } from '@app/modules/system/sys-config/sys-config.service';
import { Account } from '@app/modules/account/entities/account.entity';
import { Order } from '../order/entities/order.entity';
import { Bankcard } from '../bankcard/entities/bankcard.entity';
import { Giftcard } from '../giftcard/entities/giftcard.entity';
import { OrderService } from '../order/order.service';
import { InviteUser } from '@app/modules/inviteuser/entities/invite-user.entity';
import { ProfitRecordService } from '@app/modules/profit_record/profit_record.service';
import { CreateProfitRecordDto } from '@app/modules/profit_record/dto/create-profit_record.dto';
import { ProfitType } from '@app/modules/profit_record/entities/profit_record.entity';
import { CreateBrokerageRecordDto } from '@app/modules/brokerage_record/dto/create-brokerage_record.dto';
import { BrokerageType } from '@app/modules/brokerage_record/entities/brokerage_record.entity';
import { BrokerageRecordService } from '@app/modules/brokerage_record/brokerage_record.service';

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
    private readonly profitRecordService: ProfitRecordService,
    private readonly brokerageRecordService: BrokerageRecordService,

    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Bankcard) private readonly bankcardRepository: Repository<Bankcard>,
    @InjectRepository(Giftcard) private readonly giftcardRepository: Repository<Giftcard>,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(InviteUser) private readonly inviteUesrRepository: Repository<InviteUser>,
    @InjectRedis() private readonly redis: Redis,
    @Inject('XCXPayment') private xcxWxPay: WxPay,
    @Inject('NTVPayment') private ntvWxPay: WxPay,
    @Inject('GZHPayment') private gzhWxPay: WxPay,
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
        // await manager.update(Giftcard, { id: asset.id }, { status: '1' })
      }
    })

    if (order.assetType === '0') { // 实名商品
      const profitRecordDto: CreateProfitRecordDto ={
        type: ProfitType.OpenCardFee,
        content: '申请开卡',
        userId: userId,
        amount: order.totalPrice,
        fee: order.totalPrice - openCardProfit,
        txid: 'orderId: ' + order.id
      }
      await this.profitRecordService.create(profitRecordDto)

      if(parentId) {
        const brokerageRecordDto: CreateBrokerageRecordDto ={
          type: BrokerageType.OpenCardBrokerage,
          content: '申请开卡提成',
          userId: parentId,
          fromUserId: userId,
          amount: order.totalPrice,
          value: openCardProfit,
          txid: 'orderId: ' + order.id
        }
        await this.brokerageRecordService.create(brokerageRecordDto)
      }
    }
    
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

  /*
    创建支付订单，然后给用户发送短信。
    用户通过商户小程序进入商户网页，当用户选择相关商品购买时，
    商户系统先调用该接口在微信支付服务后台生成预支付交易单。
   **/
  async payWithWeixin(weixinPay: WeixinPayForMemberDto, userId: number, openId: string, userIp: string) {

    const order = await this.orderService.findOne(weixinPay.orderId)
    let notifyUrl = this.weixinNotifyHost
    if(weixinPay.type === WeixinPayType.XCX) {
      notifyUrl = notifyUrl + '/payment/weixinNotify'
    } else if(weixinPay.type === WeixinPayType.GZH) {
      notifyUrl = notifyUrl + '/payment/weixinGzhNotify'
    } else if(weixinPay.type === WeixinPayType.NTV) {
      notifyUrl = notifyUrl + '/payment/weixinNtvNotify'
    }
    this.logger.debug(notifyUrl)
    const params: Ijsapi = {
      description: order.desc,
      out_trade_no: 'wx' + weixinPay.orderId.toString(),
      notify_url: notifyUrl,
      amount: {
        total: Math.floor(order.totalPrice * 100), // 单位为分
        currency: 'CNY',
      },
      payer: {
        openid: openId,
      },
      scene_info: {
        payer_client_ip: userIp,
      },
    };

    const params2: Inative = {
      description: order.desc,
      out_trade_no: weixinPay.orderId.toString(),
      notify_url: notifyUrl,
      // time_expire:,
      // goods_tag:,
      amount: {
        total: Math.floor(order.totalPrice * 100), // 单位为分
        currency: 'CNY',
      },
      scene_info: {
        payer_client_ip: userIp,
      },
      // detail: {
      //   invoice_id:"wx123",
      //   goods_detail:[
      //   {
      //     goods_name: order.desc,
      //     wechatpay_goods_id:order.id.toString(),
      //     quantity:1,
      //     merchant_goods_id:"商品编码",
      //     unit_price:828800
      //   }]
      // }
    }
    // console.log(params);
    let result
    if( weixinPay.type == undefined) weixinPay.type = WeixinPayType.XCX
    if(weixinPay.type === WeixinPayType.XCX) {
      result = await this.xcxWxPay.transactions_jsapi(params);
    } else if(weixinPay.type === WeixinPayType.GZH) {
      result = await this.gzhWxPay.transactions_jsapi(params);
    } else if(weixinPay.type === WeixinPayType.NTV) {
      result = await this.ntvWxPay.transactions_native(params2);
    }
    console.log(result);
    if(result.status !== 200)
      throw new ApiException(result.message)
    // Error:
    // { status: 400, code: 'PARAM_ERROR', message: 'JSAPI支付必须传openid' }
    // Success:
    //   {
    //     appId: 'appid',
    //     timeStamp: '1609918952',
    //     nonceStr: 'y8aw9vrmx8c',
    //     package: 'prepay_id=wx0615423208772665709493edbb4b330000',
    //     signType: 'RSA',
    //     paySign: 'JnFXsT4VNzlcamtmgOHhziw7JqdnUS9qJ5W6vmAluk3Q2nska7rxYB4hvcl0BTFAB1PBEnHEhCsUbs5zKPEig=='
    //   }

    // 我们需要把这个支付订单创建成功的标记，保存起来
    const payment = new Payment()
    payment.type = '2' // 微信支付
    payment.status = '1' // 支付中
    payment.orderId = weixinPay.orderId
    payment.userId = userId
    if(weixinPay.type === WeixinPayType.XCX) {
      payment.orderTokenId = result.package.substr(10) // trim('prepay_id=')
    } else if(weixinPay.type === WeixinPayType.GZH) {
      payment.orderTokenId = result.package.substr(10) // trim('prepay_id=')
    } else if(weixinPay.type === WeixinPayType.NTV) {
      payment.orderTokenId = result.code_url // trim('prepay_id=')
    }

    await this.paymentRepository.save(payment)

    return result
  }

  // 微信支付通知
  async weixinPaymentNotify(cryptoNotifyDto: ReqWeixinPaymentNotifyDto, type: string) {
    const resource = cryptoNotifyDto.resource
    let asset: Bankcard | Giftcard
    try {
      let paymentNotify
      if (type==undefined || type === WeixinPayType.XCX) {
        paymentNotify = this.xcxWxPay.decipher_gcm<WeixinPaymentNotify>(resource.ciphertext, 
          resource.associated_data, resource.nonce);
      } else if (type === WeixinPayType.NTV) {
        paymentNotify = this.ntvWxPay.decipher_gcm<WeixinPaymentNotify>(resource.ciphertext, 
          resource.associated_data, resource.nonce);
      } else {
        paymentNotify = this.gzhWxPay.decipher_gcm<WeixinPaymentNotify>(resource.ciphertext, 
          resource.associated_data, resource.nonce);
      }
      
      this.logger.debug("Payment Notice Decoded result: " + JSON.stringify(paymentNotify))
      const orderId = paymentNotify.out_trade_no
      const order = await this.orderRepository.findOne({ where: { id: parseInt(orderId), status: '1' }, relations: { user: true, payment: true } })
      if (!order) return {code: 200, data: null}
      if (order.assetType === '0') { // 藏品
        asset = await this.bankcardRepository.findOne({ where: { id: order.assetId }, relations: { user: true } })
      } else if (order.assetType === '1') { // 盲盒
        // asset = await this.magicboxRepository.findOne({ where: { id: order.assetId }, relations: { user: true } })
      }
      if (paymentNotify.trade_state === 'SUCCESS') {
        // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
        await this.orderRepository.manager.transaction(async manager => {
          const ownerId = asset.userId
          const marketFeeString = await this.sysconfigService.getValue(SYSCONF_MARKET_FEE_KEY)
          let marketFee = Number(marketFeeString)

          if (marketFee > 1.0 || marketFee < 0.0) {
            marketFee = 0.0
          }
          marketFee = order.totalPrice * marketFee

          await manager.increment(Account, { userId: asset.userId, currencyId: 1 }, "usable", order.totalPrice - marketFee)
          await manager.increment(Account, { userId: 1, currencyId: 1 }, "usable", marketFee)
          await manager.update(Payment, { orderId: parseInt(orderId) }, { status: '2' }) // 支付完成
          await manager.update(Order, { id: parseInt(orderId) }, { status: '2' })
          
          if (order.assetType === '0') { // Bankcard
            await manager.update(Bankcard, { id: asset.id }, { status: '1' })
          } else if (order.assetType === '1') { // Giftcard
            await manager.update(Giftcard, { id: asset.id }, { status: '1' })
          }
        })
      } else {
        this.logger.error("Payment Notice not success.")
        return {code: 500, data: {code:'FAIL', message: '微信支付失败'}}
      }
    } catch (error) {
      this.logger.error("Payment Notice : " + error)
      return {code: 500, data: {code:'FAIL', message: '微信支付失败'}}
    }

    return {code: 200, data: null}
  }
}
//