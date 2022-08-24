import { ApiException } from '@app/common/exceptions/api.exception';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { createSign, createVerify } from 'crypto';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedService } from '@app/shared';
import { BankcardService } from '@app/modules/bankcard/bankcard.service';
import { OrderService } from '@app/modules/order/order.service';
import { ConfirmPayWithCardDto, PayWithCardDto, ReqConfirmPayDto, ReqCryptoNotifyDto } from './dto/request-payment.dto';
import { ReqPaymentNotify, ReqSendSMSDto, ReqSubmitPayDto, WebSignDto, WebSignNotifyDto } from './dto/request-payment.dto';
import { ConfirmPayResponse, CryptoResponse, PayResponse, SendSMSResponse, WebSignResponse } from './dto/response-payment.dto';
import { RES_CODE_SUCCESS, RES_NET_CODE } from './payment.const';

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

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly bankcardService: BankcardService,
    private readonly orderService: OrderService,
    private readonly sharedService: SharedService,
    @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
  ) {
    this.baseUrl = this.configService.get<string>('payment.baseUrl')

    this.merchId = this.configService.get<string>('payment.merchId')
    this.platformPublicKey = this.sharedService.getPublicPemFromString(this.configService.get<string>('payment.platformPublicKey'))
    this.merchSecretKey = this.sharedService.getPrivateFromString(this.configService.get<string>('payment.merchSecretKey'))
    this.merchPublicKey = this.sharedService.getPublicPemFromString(this.configService.get<string>('payment.merchPublicKey'))

    key.importKey(this.platformPublicKey, 'pkcs8-public');
    key.setOptions({ encryptionScheme: 'pkcs1' });
    key.setOptions({
      signingScheme: {
        hash: 'sha1',
      },
    })

    key2.importKey(this.merchSecretKey, 'pkcs8-private');
    key2.setOptions({ encryptionScheme: 'pkcs1' });

    // this.logger.debug(key.getMaxMessageSize())

    // Getting object of a PEM encoded X509 Certificate. 
    // const x509 = new X509Certificate(this.platformPublicKey);
    // const value = x509.publicKey
    // console.log("Type of public key :- " + value.asymmetricKeyType)

    // this.logger.debug(publicKey)
    // this.logger.debug(privateKey)
    // this.platformPublicKey = createPublicKey(platformPublicKey)
    // this.platformPublicKey = platformPublicKey
    // this.logger.debug(this.platformPublicKey)
    // this.merchSecretKey = createSecretKey(Buffer.from(merchSecretKey, 'utf8'))
    // this.logger.debug(this.merchSecretKey)
    // this.merchPublicKey = createSecretKey(Buffer.from(merchPublicKey, 'utf8'))
    // this.logger.debug(this.merchPublicKey)
  }

  // create(createPaymentDto: CreatePaymentDto) {
  //   return 'This action adds a new payment';
  // }

  // findAll() {
  //   return `This action returns all payment`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} payment`;
  // }

  // update(id: number, updatePaymentDto: UpdatePaymentDto) {
  //   return `This action updates a #${id} payment`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} payment`;
  // }


  // 网关签约接口
  async webSign(webSignDto: WebSignDto, userId: number) {
    const method = 'heepay.agreement.bank.sign.page'
    const requestUri = 'API/PageSign/Index.aspx?'
    const tradeNo = this.randomTradeNo().toString()
    const bankcard = await this.bankcardService.findOne(webSignDto.bankcardId)
    this.logger.debug(bankcard)
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
      // return_url: 'https://',
      notify_url: 'https://www.startland.top/api/payment/webSignNotify',
      out_trade_no: tradeNo,
      out_trade_time: moment().format("YYYY-MM-DD HH:mm:ss"),
    }
    this.logger.debug(JSON.stringify(bizContent));

    const bizResult = await this.sendJsonRequest<WebSignResponse>(method, requestUri, bizContent)
    this.logger.debug(bizResult)

    if (bizResult.merch_id != this.merchId) throw new ApiException("商户ID错误")
    if (bizResult.out_trade_no !== tradeNo) throw new ApiException("网签编号错误")
    await this.bankcardService.update(bankcard.id, { signTradeNo: bizContent.out_trade_no, signTradeTime: bizContent.out_trade_time })
    return bizResult.sign_url;
  }


  // 网关签约接口
  async webSignNotify(webSignNotifyDto: WebSignNotifyDto) {
    // { 
    //   "merch_id": 1664502,
    //   "out_trade_no": "1778172474",
    //   "out_trade_time": "2022-08-23 18:06:49",
    //   "sign_url": "https://pay.heepay.com/API/PageSign/www/index.html#/?pre_sign_uid=sn-22082318061002870374a07c594f40abde48c162734545E&merch_id=1664502&timespan=637968748038777025&sign=0954030f12699504565f10494e8183fc"
    // }
    // 通知返回的结果
    // { 
    //   "merch_id": "1664502",
    //   "out_trade_no": "1778172474",
    //   "out_trade_time": "2022-08-23 18:06:49",
    //   "sign_no": "DuqSTSI4gvcwr+hTj8d4smrP6Nany3ouOTylrDK5tmHEP++3fs6sisPCshu5iV7bcfYvY3ES4luoIxzp9wr2mowz4bY7H26+ONPA0PQDFdq2w7QJ9mF/+qKGVRLDUEtxtiKr3qF1uSgv5TlBs4N07BxgFUUoXIM/XZ6K8BdqHathmUMzpQD9Hhz8AoKwcpbBN/waphyGWUQzec9do5rnfyi/WGIxpqkxPNzdoLY78wFXDV1Hlyd+5JUd89PwRriKDuSNa9d77SJUpimCBfv6cUGz8FOBaggVER2QhP9fbdOxTyfmf1gs8e0phh2RVPdWj7FopX6FCevUnbGQzy2dPA==",
    //   "sign": "kKAxbAeWmbIgEM+HQt5du2jP9mutEi4EFHpmeh87enAyLZjt3EAIa9uAbBRjknFMB6CNCJHrn2+SXrXnSXzp+ZO0etnaUXOetwwWOdyAy6io1fQugC8BnG+TXpLJOIIUVeayFdlo43nISC7N3444ytcDcBR/FoCVjBtp3TXYYPXamzYoHgct+/vfgqKdJJgDjKjjIO4rgQf5yletWXiECrUg0hxWMoAARLTOj0BWVt8C+7v1S99bXPIilxWcY5EklikwcId5LR9pMbqNVvj00YXPEhT5K0u9qF/aWUZHWB0bdL8b2XdnbX7TfepBuymBbDWPuw9Aiwh/O+RHZuZlSw=="
    // }
    //
    // sign_no 是加密的，我们需要解密
    const signNo = key2.decrypt(webSignNotifyDto.sign_no, 'utf8');
    this.logger.debug(signNo)
    // 验证签名
    // return JSON.parse(decryptedData);

    // 我们需要把这个signNo保存到数据库里
    this.bankcardService.updateWithTradeNo(webSignNotifyDto.out_trade_no, webSignNotifyDto.out_trade_time, { status: '1', signNo: signNo })
  }

  // 网关签约查询
  async queryBankSign() {

  }

  // 提交支付
  async submitPay(orderId: number, userIp: string) {
    const requestUri = 'WithholdAuthPay/ConfirmPay.aspx'

    const order = await this.orderService.findOne(orderId)

    const tradeNo = this.randomTradeNo().toString()

    const bizContent = new ReqSubmitPayDto()
    bizContent.agent_bill_id = order.id.toString()
    bizContent.agent_bill_time = moment().format("YYYYMMDDHHmmss")
    bizContent.goods_name = order.desc
    bizContent.pay_amt = order.realPrice
    bizContent.hy_auth_uid = ''
    bizContent.user_ip = userIp
    bizContent.notify_url = 'http://www.baidu.com'
    bizContent.return_url = 'http://www.baidu.com'

    await this.sendCryptoRequest(requestUri, bizContent)
  }

  // 创建支付订单，然后给用户发送短信。
  async sendPaySMS(payWithCard: PayWithCardDto, userId: number, userIp: string) {
    const requestUri = 'WithholdAuthPay/SendPaySMS.aspx'
    const order = await this.orderService.findOne(payWithCard.orderId)
    const bankcard = await this.bankcardService.findOne(payWithCard.bankcardId)

    if (bankcard.signNo === undefined || bankcard.signNo === '') {
      throw new ApiException('此银行卡没有实名或者')
    }
    const bizContent = new ReqSendSMSDto()

    bizContent.agent_bill_id = order.id.toString()
    bizContent.agent_bill_time = moment().format("YYYYMMDDHHmmss")
    bizContent.goods_name = order.desc
    bizContent.pay_amt = order.realPrice
    bizContent.hy_auth_uid = bankcard.signNo
    bizContent.user_ip = userIp
    bizContent.notify_url = 'https://www.startland.top/api/payment/paymentNotify'
    // bizContent.return_url = 'http://www.baidu.com'
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

    await this.paymentRepository.save(payment)

    return;
  }

  // 支付通知
  async paymentNotify(cryptoNotifyDto: ReqCryptoNotifyDto) {
    // sign_no 是加密的，我们需要解密
    const decryptedData = key2.decrypt(cryptoNotifyDto.encrypt_data, 'utf8');
    this.logger.debug("paymentNotify")
    this.logger.debug(decryptedData)
    let isSignOk = true
    // 验证签名
    const verify = createVerify('RSA-SHA1');
    verify.write(decryptedData);
    verify.end();
    isSignOk = verify.verify(this.platformPublicKey, cryptoNotifyDto.sign, 'base64');
    // Prints: true
    // 处理支付结果
    if (!isSignOk) {
      return false
    }
    const paymentNotify: ReqPaymentNotify = JSON.parse(decryptedData)
    if (paymentNotify.status === 'SUCCESS') {
      const orderId = paymentNotify.agent_bill_id
      await this.paymentRepository.update(parseInt(orderId), { status: '1', order: { status: '2' } })
    } else {
    }
    return true



  }

  // 确认支付
  async confirmPayment(confirmPayDto: ConfirmPayWithCardDto, userId: number) {
    const requestUri = 'WithholdAuthPay/ConfirmPay.aspx'
    const payment = await this.paymentRepository.findOneBy({ id: confirmPayDto.paymentId, userId: userId })
    if (payment === null) {
      throw new ApiException('未找到支付项')
    }
    // if (bankcard.signNo === undefined || bankcard.signNo === '') {
    //   throw new ApiException('此银行卡没有实名或者')
    // }
    const bizContent = new ReqConfirmPayDto()
    bizContent.version = '1'
    bizContent.hy_token_id = payment.orderTokenId
    bizContent.verify_code = confirmPayDto.verifyCode
    const bizResult = await this.sendCryptoRequest<ConfirmPayResponse>(requestUri, bizContent)
    this.logger.debug(bizResult)

    if (bizResult.agent_id.toString() != this.merchId) throw new ApiException("商户ID错误")
    if (bizResult.ret_code !== RES_CODE_SUCCESS) throw new ApiException("错误: " + bizResult.ret_msg)
    // 我们需要把这个支付订单创建成功的标记
    await this.paymentRepository.update(confirmPayDto.paymentId, { orderBillNo: bizResult.hy_bill_no })

    return;
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
    // this.logger.debug(responseData.code)
    // this.logger.debug(responseData.msg)
    // this.logger.debug(responseData.sub_code)
    // this.logger.debug(responseData.data)
    // this.logger.debug(responseData.sign)
    if (responseData.code == RES_NET_CODE) {


      const decryptedData = key2.decrypt(responseData.data, 'utf8');
      this.logger.debug(decryptedData)
      // 验证签名
      const verify = createVerify('RSA-SHA1');
      verify.write(decryptedData);
      verify.end();
      verify.verify(this.platformPublicKey, responseData.sign, 'base64');
    }
    throw new ApiException('签约请求失败: ' + responseData.msg)
  }

  /* 发送请求的通用接口 */
  async sendCryptoRequest<T>(
    requestUri: string, bizContent: any
  ): Promise<T> {


    // 业务参数进行加密
    // 使用支付平台公钥加密bizConent这个json格式的字符串
    // const encryptData = publicEncrypt(this.platformPublicKey, Buffer.from(JSON.stringify(bizContent)));
    // Get bizContent string
    const bizContentStr = this.sharedService.compactJsonToString(bizContent)
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
    let res = await this.httpService.axiosRef.post<CryptoResponse>(remoteUrl, body, options);
    const responseData = res.data
    this.logger.debug(responseData)
    if (responseData.ret_code == RES_CODE_SUCCESS) {
      const decryptedData = key2.decrypt(responseData.encrypt_data, 'utf8');
      this.logger.debug(decryptedData)
      // 验证签名
      const verify = createVerify('RSA-SHA1');
      verify.write(decryptedData);
      verify.end();
      verify.verify(this.platformPublicKey, responseData.sign, 'base64');
    }
    throw new ApiException('签约请求失败: ' + responseData.ret_msg)
  }
  //
}
//