import { ApiException } from '@app/common/exceptions/api.exception';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as querystring from 'querystring';
import { createSign, createVerify } from 'crypto';
import { Payment } from './entities/payment.entity';
import { EntityManager, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedService } from '@app/shared';
import { BankcardService } from '@app/modules/bankcard/bankcard.service';
import { OrderService } from '@app/modules/order/order.service';

import { ConfirmPayWithCardDto, PayWithCardDto, ReqConfirmPayDto, ReqCryptoNotifyDto } from './dto/request-payment.dto';
import { ReqPaymentNotify, ReqSendSMSDto, ReqSubmitPayDto, WebSignDto, WebSignNotifyDto } from './dto/request-payment.dto';
import { ConfirmPayResponse, CryptoResponse, PayResponse, SendSMSResponse, WebSignResponse } from './dto/response-payment.dto';
import { RES_CODE_SUCCESS, RES_NET_CODE } from './payment.const';
import { Collection } from '../collection/entities/collection.entity';
import { CreateAssetDto } from '../collection/dto/request-asset.dto';
import { MintADto } from '@app/chain';
import { ClientProxy } from '@nestjs/microservices';
import { Activity } from '../activity/entities/activity.entity';
import { Asset } from '../collection/entities/asset.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { Order } from '../order/entities/order.entity';
import { ACTIVITY_USER_ORDER_KEY } from '@app/common/contants/redis.contant';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Account } from '../account/entities/account.entity';
import { firstValueFrom } from 'rxjs';
import { Magicbox } from '../magicbox/entities/magicbox.entity';
import { MagicboxRecord } from '../magicbox/entities/magicbox-record.entity';
import { CollectionService } from '../collection/collection.service';
import { SysConfigService } from '../system/sys-config/sys-config.service';
import { SYSCONF_COLLECTION_FEE_KEY, SYSCONF_MARKET_FEE_KEY } from '@app/common/contants/sysconfig.contants';
import { truncate } from 'fs';

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
  platformAddress: string

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly bankcardService: BankcardService,
    private readonly orderService: OrderService,
    private readonly sharedService: SharedService,
    private readonly sysconfigService: SysConfigService,
    private readonly collectionService: CollectionService,

    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Magicbox) private readonly magicboxRepository: Repository<Magicbox>,
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
    @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
    @InjectRepository(MagicboxRecord) private readonly magicboxRecordRepository: Repository<MagicboxRecord>,
    @InjectRedis() private readonly redis: Redis,
    @Inject('CHAIN_SERVICE') private client: ClientProxy,
  ) {
    this.baseUrl = this.configService.get<string>('payment.baseUrl')
    this.merchId = this.configService.get<string>('payment.merchId')
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
  }

  // 网关签约接口
  async webSign(webSignDto: WebSignDto, userId: number) {
    const method = 'heepay.agreement.bank.sign.page'
    const requestUri = 'API/PageSign/Index.aspx?'
    const tradeNo = this.randomTradeNo().toString()
    const bankcard = await this.bankcardService.findOne(webSignDto.bankcardId)
    // this.logger.debug(bankcard)
    if (bankcard == null) {
      throw new ApiException('没有此银行卡')
    }

    if (bankcard.userId != userId) {
      throw new ApiException('非本人银行卡')
    }
    const bizContent = {
      bank_card_no: bankcard.cardNo,
      bank_card_type: bankcard.cardType,
      bank_user_name: bankcard.identity.realName,
      bank_type: bankcard.cardType,
      cert_no: bankcard.identity.cardId,
      mobile: bankcard.mobile,
      merch_user_id: userId.toString(),
      // from_user_ip: "219.143.153.103",
      return_url: 'https://www.startland.top',
      notify_url: 'https://www.startland.top/api/payment/webSignNotify',
      out_trade_no: tradeNo,
      out_trade_time: moment().format("YYYY-MM-DD HH:mm:ss"),
    }
    // this.logger.debug(JSON.stringify(bizContent));

    const bizResult = await this.sendJsonRequest<WebSignResponse>(method, requestUri, bizContent)
    this.logger.debug(bizResult)

    if (bizResult.merch_id != this.merchId) throw new ApiException("商户ID错误")
    if (bizResult.out_trade_no !== tradeNo) throw new ApiException("网签编号错误")
    await this.bankcardService.update(bankcard.id, { signTradeNo: bizContent.out_trade_no, signTradeTime: bizContent.out_trade_time })
    return bizResult.sign_url;
  }


  // 网关签约接口
  async webSignNotify(webSignNotifyDto: WebSignNotifyDto) {
    // sign_no 是加密的，我们需要解密
    const signNo = key2.decrypt(webSignNotifyDto.sign_no, 'utf8');
    this.logger.debug(signNo)
    // 验证签名
    const verifyData = this.sharedService.compactJsonToString({
      merch_id: webSignNotifyDto.merch_id,
      out_trade_no: webSignNotifyDto.out_trade_no,
      out_trade_time: webSignNotifyDto.out_trade_time,
      sign_no: signNo,
    })
    this.logger.debug(verifyData)
    // 验证签名
    const verify = createVerify('RSA-SHA1');
    verify.write(verifyData);
    verify.end();
    const verifyOk = verify.verify(this.platformPublicKey, webSignNotifyDto.sign, 'base64');
    this.logger.debug(verifyOk)
    if (!verifyOk) {
      return 'error'
    }
    // 我们需要把这个signNo保存到数据库里
    this.bankcardService.updateWithTradeNo(webSignNotifyDto.out_trade_no, webSignNotifyDto.out_trade_time, { status: '1', signNo: signNo })
    return 'ok'
  }

  // 网关签约查询
  async queryBankSign() {

  }

  // 创建支付订单，然后给用户发送短信。
  async sendPaySMS(payWithCard: PayWithCardDto, userId: number, userIp: string) {
    const requestUri = 'WithholdAuthPay/SendPaySMS.aspx'
    const order = await this.orderService.findOne(payWithCard.orderId)
    const bankcard = await this.bankcardService.findOne(payWithCard.bankcardId)

    if (bankcard.signNo === undefined || bankcard.signNo === '') {
      throw new ApiException('此银行卡没有实名')
    }
    const bizContent = new ReqSendSMSDto()
    bizContent.agent_bill_id = order.id.toString()
    bizContent.agent_bill_time = moment().format("YYYYMMDDHHmmss")
    bizContent.goods_name = order.desc
    bizContent.hy_auth_uid = bankcard.signNo
    bizContent.notify_url = 'https://www.startland.top/payment/notify'
    bizContent.pay_amt = order.totalPrice
    bizContent.user_ip = userIp
    bizContent.version = 1
    bizContent.return_url = 'https://www.startland.top'
    this.logger.debug(JSON.stringify(bizContent))

    const bizResult = await this.sendCryptoRequest<SendSMSResponse>(requestUri, bizContent)
    this.logger.debug(bizResult)

    if (bizResult.agent_id.toString() != this.merchId) throw new ApiException("商户ID错误")
    if (bizResult.ret_code !== RES_CODE_SUCCESS) throw new ApiException("错误: " + bizResult.ret_msg)
    // 我们需要把这个支付订单创建成功的标记，保存起来
    const payment = new Payment()
    payment.type = '1' // 银行卡支付
    payment.status = '1' // 支付中
    payment.bankcardId = bankcard.id
    payment.orderId = payWithCard.orderId
    payment.userId = userId
    payment.orderTokenId = bizResult.hy_token_id
    payment.userId = order.userId

    return await this.paymentRepository.save(payment)
  }

  // 确认支付
  async confirmPayment(confirmPayDto: ConfirmPayWithCardDto, userId: number, userName: string) {
    this.logger.debug(confirmPayDto)
    const requestUri = 'WithholdAuthPay/ConfirmPay.aspx'
    const payment = await this.paymentRepository.findOneBy({ id: confirmPayDto.paymentId, userId: userId })
    if (payment === null) {
      throw new ApiException('未找到支付项')
    }
    // if (bankcard.signNo === undefined || bankcard.signNo === '') {
    //   throw new ApiException('此银行卡没有实名或者')
    // }
    const bizContent = new ReqConfirmPayDto()
    bizContent.version = 1
    bizContent.hy_token_id = payment.orderTokenId
    bizContent.verify_code = confirmPayDto.verifyCode
    // this.logger.debug(bizContent)
    const bizResult = await this.sendCryptoRequest<ConfirmPayResponse>(requestUri, bizContent)
    // this.logger.debug(bizResult)
    if (bizResult.agent_id.toString() != this.merchId) throw new ApiException("商户ID错误")
    if (bizResult.ret_code !== RES_CODE_SUCCESS) throw new ApiException("错误: " + bizResult.ret_msg)
    // 我们需要把这个支付订单创建成功的标记
    // 支付中，等待确认
    await this.paymentRepository.update(confirmPayDto.paymentId, { orderBillNo: bizResult.hy_bill_no, status: '1' })
    // await this.paymentRepository.update({ orderId: payment.orderId }, { status: '1' })
  }

  // 支付通知
  async paymentNotify(cryptoNotifyDto: ReqCryptoNotifyDto) {
    // sign_no 是加密的，我们需要解密
    try {
      // this.logger.debug("paymentNotify")
      // this.logger.debug(JSON.stringify(cryptoNotifyDto))
      const decryptedData = key2.decrypt(cryptoNotifyDto.encrypt_data, 'utf8');
      this.logger.debug(decryptedData)
      let isSignOk
      // 验证签名
      // const verify = createVerify('RSA-SHA1');
      // verify.write(decryptedData);
      // verify.end();
      // isSignOk = verify.verify(this.platformPublicKey, cryptoNotifyDto.sign, 'base64');
      // // Prints: true
      isSignOk = true
      // 处理支付结果
      if (!isSignOk) {
        return 'error'
      }
      const paymentNotify: any = querystring.parse(decryptedData)
      if (paymentNotify.status === 'SUCCESS') {
        // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
        await this.orderRepository.manager.transaction(async manager => {
          const orderId = paymentNotify.agent_bill_id
          const order = await manager.findOne(Order, { where: { id: parseInt(orderId), status: '1' }, relations: { user: true, payment: true } })
          if (!order) return 'ok'
          await manager.update(Payment, { orderId: parseInt(orderId) }, { status: '2' }) // 支付完成
          await manager.update(Order, { id: parseInt(orderId) }, { status: '2' })
          if (order.type === '0') {
            const unpayOrderKey = ACTIVITY_USER_ORDER_KEY + ":" + order.activityId + ":" + order.userId
            // 取消未支付状态
            await this.redis.del(unpayOrderKey)
            await this.doPaymentComfirmedLv1(order, order.userId)
          } else if (order.type === '1') {
            await this.doPaymentComfirmedLv2(order, order.userId)
          } else if (order.type === '2') {
            await this.doPaymentComfirmedRecharge(order.payment, order.userId, order.user.userName)
          }
        })
      } else {
        this.logger.error("Payment Notice not success.")
        return 'error'
      }
    } catch (error) {
      this.logger.error("Payment Notice : " + error)
      return 'error'
    }

    return 'ok'
  }

  async payWithBalance(id: number, userId: number) {
    const order = await this.orderRepository.findOne({ where: { id: id, status: '1', userId: userId }, relations: { user: true } })
    if (order == null) {
      throw new ApiException('订单状态错误')
    }
    let asset: Asset | Magicbox

    if (order.type === '1') { // 二级市场
      if (order.assetType === '0') { // 藏品
        asset = await this.assetRepository.findOne({ where: { id: order.assetId }, relations: { user: true } })
        if (asset.userId === userId)
          throw new ApiException("不能购买自己的藏品")
      } else if (order.assetType === '1') { // 盲盒
        asset = await this.magicboxRepository.findOne({ where: { id: order.assetId }, relations: { user: true } })
        if (asset.userId === userId)
          throw new ApiException("不能购买自己的盲盒")
      }
    }

    await this.orderRepository.manager.transaction(async manager => {
      const result = await manager.decrement(Account, { userId: userId, usable: MoreThanOrEqual(order.totalPrice) }, "usable", order.totalPrice);
      // this.logger.log(JSON.stringify(result));
      if (!result.affected) {
        throw new ApiException('支付失败')
      }
      // order.status = '2';
      // 把Order的状态改成2: 已支付
      await manager.update(Order, { id: order.id }, { status: '2' })
      if (order.type === '1') {
        const marketFeeString = await this.sysconfigService.getValue(SYSCONF_MARKET_FEE_KEY)
        this.logger.debug(marketFeeString)
        let marketFee = Number(marketFeeString)

        const configString = await this.sysconfigService.getValue(SYSCONF_COLLECTION_FEE_KEY)
        if (configString) {
          const configValue = JSON.parse(configString)
          const asset = await this.collectionService.hasOne(configValue.collectionId, userId)
          if (asset) {
            this.logger.debug('collection config ratio ' + configValue.ratio)
            marketFee = Number(configValue.ratio)
          }
        }
        this.logger.debug('marketFee ' + marketFee)
        if (marketFee > 1.0 || marketFee < 0.0) {
          marketFee = 0.0
        }
        marketFee = order.totalPrice * marketFee

        await manager.increment(Account, { userId: asset.userId }, "usable", order.totalPrice - marketFee)
        await manager.increment(Account, { userId: 1 }, "usable", marketFee)
      }

    })

    await this.orderRepository.manager.transaction(async manager => {
      if (order.type === '0') { // 一级市场
        const unpayOrderKey = ACTIVITY_USER_ORDER_KEY + ":" + order.activityId + ":" + order.userId
        await this.doPaymentComfirmedLv1(order, order.userId)
        // 取消未支付状态
        await this.redis.del(unpayOrderKey)
      } else if (order.type === '1') { // 二级市场
        await this.doPaymentComfirmedLv2(order, order.userId)
      }
    })

    return order;
  }

  // 交易查询
  async queryPayment() {

  }

  private randomTradeNo(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }

  /* 发送请求的通用接口 */
  async sendJsonRequest<T>(
    method: string, requestUri: string, bizContent: any
  ): Promise<T> {

    // Get bizContent string
    const bizContentStr = JSON.stringify(bizContent)
    // Encrypt bizContent
    const encryptData = key.encrypt(JSON.stringify(bizContent)).toString('base64');
    this.logger.debug(encryptData)

    let body = {
      "biz_content": bizContentStr,
      "merch_id": this.merchId,
      "method": method,
      "timestamp": moment().format("YYYY-MM-DD HH:mm:ss"),
      "version": "1.0",
    }

    // Construct raw request body.
    const bodyString = this.sharedService.compactJsonToString(body)
    this.logger.debug(bodyString)

    // 使用商户私钥对请求字符串进行签名
    const sign = createSign('RSA-SHA1');
    sign.update(bodyString);
    sign.end();
    const signContent = sign.sign(this.merchSecretKey).toString('base64');
    body.biz_content = encryptData

    // body2 add sign.
    const body2 = {
      ...body,
      sign: signContent
    }
    this.logger.debug(body2)

    let options = {
      // headers: {
      //   // 'Content-Type': 'application/json; charset=utf-8'
      // }
    }

    // Call request.
    const remoteUrl = this.baseUrl + requestUri
    let res = await this.httpService.axiosRef.post<PayResponse<T>>(remoteUrl, body2, options);

    const responseData = res.data

    if (responseData.code == RES_NET_CODE) {
      const decryptedData = key2.decrypt(responseData.data, 'utf8');
      this.logger.debug('this')
      const verifyData = this.sharedService.compactJsonToString({
        code: responseData.code,
        data: decryptedData,
        msg: responseData.msg,
        sub_code: responseData.sub_code,
        sub_msg: responseData.sub_msg
      })
      this.logger.debug(verifyData)
      // 验证签名
      const verify = createVerify('RSA-SHA1');
      verify.write(verifyData);
      verify.end();
      const verifyOk = verify.verify(this.platformPublicKey, responseData.sign, 'base64');
      this.logger.debug(verifyOk)
      if (verifyOk) {
        return JSON.parse(decryptedData)
      }
      throw new ApiException('签约请求失败: ' + '签名校验失败')
    }
    throw new ApiException('签约请求失败: ' + responseData.msg)
  }

  /* 发送请求的通用接口 */
  async sendCryptoRequest<T>(
    requestUri: string, bizContent: any
  ): Promise<any> {


    // 业务参数进行加密
    // 使用支付平台公钥加密bizConent这个json格式的字符串
    // const encryptData = publicEncrypt(this.platformPublicKey, Buffer.from(JSON.stringify(bizContent)));
    // Get bizContent string
    const bizContentStr = this.sharedService.compactJsonToString(bizContent)
    this.logger.debug(bizContentStr)
    // Encrypt bizContent
    const encryptData = key.encrypt(bizContentStr).toString('base64');
    this.logger.debug(encryptData)

    // 对请求字符串进行签名
    const sign = createSign('RSA-SHA1');
    sign.update(bizContentStr);
    sign.end();
    const signContent = sign.sign(this.merchSecretKey).toString('base64');

    let options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
    let body = {
      agent_id: this.merchId,
      encrypt_data: encryptData,
      sign: signContent
    }
    const remoteUrl = this.baseUrl + requestUri
    // this.logger.debug(querystring.stringify(body))
    let res = await this.httpService.axiosRef.post(remoteUrl, querystring.stringify(body), options);

    const responseData = await this.sharedService.xmlToJson<CryptoResponse>(res.data)

    this.logger.debug(responseData)
    if (responseData.ret_code == RES_CODE_SUCCESS) {
      const decryptedData = key2.decrypt(responseData.encrypt_data, 'utf8');
      this.logger.debug(decryptedData)
      // 验证签名
      const verify = createVerify('RSA-SHA1');
      verify.write(decryptedData);
      verify.end();
      const verifyOk = verify.verify(this.platformPublicKey, responseData.sign, 'base64');
      this.logger.debug(verifyOk)
      return querystring.parse(decryptedData)
    }
    throw new ApiException('发送请求失败: ' + responseData.ret_msg)
  }

  async doPaymentComfirmedLv1(order: Order, userId: number) {
    // Create assetes for user.
    const activity = await this.activityRepository.findOne({ where: { id: order.activityId }, relations: { collections: { contract: true } } })
    // First we need get all collections of orders, but we only get one collection.
    if (!activity.collections || activity.collections.length <= 0) {
      return order;
    }
    let collection: Collection;
    if (order.assetType === '1') { // 盲盒
      // 首发盲盒,
      await this.doBuyMagicBoxOrder(order)
    } else { //藏品
      // 其他类型，我们只需要取第一个
      collection = activity.collections[0];
      await this.doBuyAssetOrder(order, collection)
    }
  }

  async doBuyMagicBoxOrder(order: Order) {
    // 首先获取一个未售出的magicbox
    await this.magicboxRepository.manager.transaction('SERIALIZABLE', async manager => {
      const magicboxs = await manager.find(Magicbox, { where: { openStatus: '0', activityId: order.activityId }, take: order.count })
      if (magicboxs.length !== order.count) throw new ApiException("Remain magicbox is less than order number.")
      await Promise.all(magicboxs.map(async (magicbox) => {
        await manager.update(Magicbox, { id: magicbox.id, openStatus: '0' }, { openStatus: '1', userId: order.userId })
        // 记录交易记录
        await manager.save(MagicboxRecord, {
          type: '2', // Buy
          magicboxId: magicbox.id,
          price: order.realPrice,
          toId: order.userId,
          toName: order.user.nickName
        })
      }))
    })
  }

  async doBuyAssetOrder(order: Order, collection: Collection) {
    // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
    await this.collectionRepository.manager.transaction(async manager => {
      await manager.increment(Collection, { id: collection.id }, "current", order.count);
    })
    for (let i = 0; i < order.count; i++) {
      const tokenIndex = i + 1
      let createAssetDto = new CreateAssetDto()
      createAssetDto.price = order.realPrice
      createAssetDto.index = tokenIndex
      createAssetDto.userId = order.userId
      createAssetDto.collectionId = collection.id

      const asset = this.assetRepository.create(createAssetDto)
      await this.assetRepository.save(asset)
      // 记录交易记录
      await this.assetRecordRepository.save({
        type: '2', // Buy
        assetId: asset.id,
        price: order.realPrice,
        toId: order.userId,
        toName: order.user.nickName
      })

      const pattern = { cmd: 'mintA' }
      const mintDto = new MintADto()
      mintDto.address = this.platformAddress
      mintDto.tokenId = tokenIndex.toString()
      mintDto.contractId = collection.contractId
      mintDto.contractAddr = collection.contract.address
      await firstValueFrom(this.client.send(pattern, mintDto))
    }
  }

  async doPaymentComfirmedLv2(order: Order, userId: number) {
    let userName = order.user.userName

    if (order.assetType === '0') { // 藏品
      let asset: Asset
      asset = await this.assetRepository.findOne({ where: { id: order.assetId }, relations: { user: true } })
      if (asset.userId === userId)
        throw new ApiException("不能购买自己的藏品")
      await this.buyAssetRecord(asset, userId, userName)
    }
    else if (order.assetType === '1') { // 盲盒
      let magicbox: Magicbox
      magicbox = await this.magicboxRepository.findOne({ where: { id: order.assetId }, relations: { user: true } })
      if (magicbox.userId === userId)
        throw new ApiException("不能购买自己的盲盒")
      await this.buyMagicboxRecord(magicbox, userId, userName)
    }
  }

  async doPaymentComfirmedRecharge(payment: Payment, userId: number, userName: string) {
    const order = await this.orderService.findOne(payment.orderId)
    await this.accountRepository.increment({ userId: payment.userId }, 'usable', order.totalPrice)
  }

  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }

  private async buyAssetRecord(asset: Asset, userId: number, userName: string) {

    const fromId = asset.user.userId
    const fromName = asset.user.userName

    await this.assetRepository.update({ id: asset.id }, { status: '0', userId: userId })

    await this.assetRecordRepository.save({
      type: '2', // Buy
      assetId: asset.id,
      price: asset.price,
      fromId: fromId,
      fromName: fromName,
      toId: userId,
      toName: userName
    })
  }

  private async buyMagicboxRecord(magicbox: Magicbox, userId: number, userName: string) {

    const fromId = magicbox.user.userId
    const fromName = magicbox.user.userName
    await this.magicboxRepository.update({ id: magicbox.id }, { status: '0', userId: userId })
    await this.magicboxRecordRepository.save({
      type: '2', // Buy
      magicboxId: magicbox.id,
      price: magicbox.price,
      fromId: fromId,
      fromName: fromName,
      toId: userId,
      toName: userName
    })
  }
}
//