import { ApiException } from '@app/common/exceptions/api.exception';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isDev } from 'apps/nestjs-backend/src/config/configuration';
import { json } from 'body-parser';
import { random } from 'lodash';
import moment from 'moment';
import * as querystring from 'querystring';
import { BankcardService } from '../bankcard/bankcard.service';
import { CreatePaymentDto, ReqSubmitPayDto, UpdatePaymentDto } from './dto/request-payment.dto';
import { PayResponse, WebSignResponse } from './dto/response-payment.dto';
import { RES_CODE_SUCCESS, RES_NET_CODE } from './payment.const';

import { generateKeyPairSync, privateEncrypt, publicDecrypt, createSign } from 'crypto';
import { enc } from 'crypto-js';
import { OrderService } from '../order/order.service';
import { USER_CID_KEY } from '@app/common/contants/redis.contant';

@Injectable()
export class PaymentService {
  logger = new Logger(PayResponse.name)
  baseUrl: string
  platformPublicKey: string
  merchSecretKey: string
  merchPublicKey: string
  merchId: string
  // publicKey: string
  // privateKey: string
  // Basic initialization

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly bankcardService: BankcardService,
    private readonly orderService: OrderService,
  ) {
    this.baseUrl = this.configService.get<string>('payment.baseUrl')
    this.platformPublicKey = this.configService.get<string>('payment.platformPublicKey')
    this.merchSecretKey = this.configService.get<string>('payment.merchSecretKey')
    this.merchPublicKey = this.configService.get<string>('payment.merchPublicKey')
    this.merchId = this.configService.get<string>('payment.merchId')


    // const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    //   modulusLength: 2048,
    //   publicKeyEncoding: {
    //     type: 'spki',
    //     format: 'pem'
    //   },
    //   privateKeyEncoding: {
    //     type: 'pkcs8',
    //     format: 'pem',
    //     cipher: 'aes-256-cbc',
    //     passphrase: 'top secret'
    //   }
    // });
    // this.publicKey = publicKey
    // this.privateKey = privateKey


    // // Increase amount of entropy
    // var entropy = 'Random string, integer or float';
    // var crypt = new Crypt({ entropy: entropy });
  }
  create(createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

  // 网关签约接口
  async webSign(userId: number, bankId: number) {
    const method = 'heepay.agreement.bank.sign.page'
    const requestUri = 'API/PageSign/Index.aspx?'
    const tradeNo = this.randomTradeNo().toString()
    const bankcard = await this.bankcardService.findOne(bankId)
    if (bankcard == null) {
      throw new ApiException('没有此银行卡')
    }

    if (bankcard.userId != userId) {
      throw new ApiException('非本人银行卡')
    }
    const bizContent = {
      out_trade_no: tradeNo,
      out_trade_time: moment().format("YYYY-MM-DD HH:mm:ss"),
      merch_user_id: userId,
      bank_card_type: bankcard.cardType,
      notify_url: 'http://',
      bank_card_no: bankcard.cardNo,
      bank_card_name: bankcard.cardName,
      cert_no: bankcard.certNo,
      mobile: bankcard.mobile,
    }
    this.logger.debug(bizContent);
    const bizResult = await this.sendJsonRequest<WebSignResponse>(method, requestUri, bizContent)
    if (bizResult.merch_id !== this.merchId) throw new ApiException("商户ID错误")
    if (bizResult.out_trade_no !== tradeNo) throw new ApiException("网签编号错误")
    return bizResult.sign_url;
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

    this.sendCryptoRequest(requestUri, bizContent)
  }

  // 发送支付短信
  async sendPaySMS() {

  }

  // 确认支付
  async commitPay() {

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

    let body = {
      biz_content: bizContent,
      merch_id: this.merchId,
      method: method,
      timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
      version: '1.0',
      sign: undefined,
    }

    // 业务参数进行加密
    // 使用支付平台公钥加密bizConent这个json格式的字符串
    const encryptData = privateEncrypt(this.platformPublicKey, Buffer.from(JSON.stringify(bizContent)));

    // 对公共请求参数进行签名，这部分是公用的，所以我们放在这里
    const bodyString = querystring.stringify(body)
    this.logger.debug(bodyString)

    // 使用商家私钥对请求字符串进行签名
    const sign = createSign('RSA-SHA1');
    sign.update(bodyString);
    sign.end();
    const signContent = sign.sign(this.merchSecretKey).toString('base64');
    body.sign = signContent

    // 把bizContent换成加密后的内容
    body.biz_content = encryptData

    let options = {
      // headers: {
      //   "Authorization": auth,
      //   "Content-Type": "application/x-www-form-urlencoded"
      // }
    }

    const remoteUrl = this.baseUrl + requestUri
    let res = await this.httpService.axiosRef.post<PayResponse<T>>(remoteUrl, JSON.stringify(body), options);
    const responseData = res.data
    this.logger.debug(responseData.code)
    this.logger.debug(responseData.msg)
    this.logger.debug(responseData.sub_code)
    this.logger.debug(responseData.data)
    this.logger.debug(responseData.sign)
    if (responseData.code == RES_NET_CODE) {
      // if (responseData.sub_code === '') {
      //   //  success for identity.
      // }
      // 返回的data没有加密，但是包含签名
      // 验证签名
      // 对公共请求参数进行验证签名，这部分是公用的，所以我们放在这里
      const bodyString = querystring.stringify(body)
      this.logger.debug(bodyString)
      return responseData.data;
    }
    throw new ApiException('签约请求失败: ' + responseData.msg)
  }

  /* 发送请求的通用接口 */
  async sendCryptoRequest<T>(
    requestUri: string, bizContent: any
  ): Promise<boolean> {


    // 业务参数进行加密
    // 使用支付平台公钥加密bizConent这个json格式的字符串
    const encryptData = privateEncrypt(this.platformPublicKey, Buffer.from(JSON.stringify(bizContent)));

    let options = {
      headers: {
        "agent_id": this.merchId,
        "version": '1',
        // "Content-Type": "application/x-www-form-urlencoded"  
      }
    }

    // 对请求字符串进行签名
    const sign = createSign('RSA-SHA1');
    sign.update(encryptData);
    sign.end();
    const signContent = sign.sign(this.merchSecretKey).toString('base64');

    let body = {
      agent_id: this.merchId,
      encrypt_data: encryptData,
      sign: signContent
    }

    this.logger.debug(encryptData);
    this.logger.debug(signContent);

    const remoteUrl = this.baseUrl + requestUri
    let res = await this.httpService.axiosRef.post<T>(remoteUrl, body, options);
    const responseData: any = res.data
    if (responseData.code == RES_CODE_SUCCESS) {
      return responseData
    }
    throw new ApiException('加密请求失败: ' + responseData.ret_msg)
  }
}


