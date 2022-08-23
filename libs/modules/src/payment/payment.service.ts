import { ApiException } from '@app/common/exceptions/api.exception';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
const fs = require("fs");
import * as querystring from 'querystring';
import { createPublicKey, X509Certificate } from 'crypto';
import { BankcardService } from '../bankcard/bankcard.service';
import { CreatePaymentDto, ReqSubmitPayDto, UpdatePaymentDto, WebSignDto, WebSignNotifyDto } from './dto/request-payment.dto';
import { PayResponse, WebSignResponse } from './dto/response-payment.dto';
import { RES_CODE_SUCCESS, RES_NET_CODE } from './payment.const';

import { generateKeyPairSync, createSign, publicEncrypt } from 'crypto';
import { OrderService } from '../order/order.service';
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
  ) {
    this.baseUrl = this.configService.get<string>('payment.baseUrl')

    this.merchId = this.configService.get<string>('payment.merchId')

    this.platformPublicKey = this.getPublicPemFromString(this.configService.get<string>('payment.platformPublicKey'))
    this.merchSecretKey = this.getPrivateFromString(this.configService.get<string>('payment.merchSecretKey'))
    this.merchPublicKey = this.getPublicPemFromString(this.configService.get<string>('payment.merchPublicKey'))

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
  async webSign(webSignDto: WebSignDto, userId: number) {
    const method = 'heepay.agreement.bank.sign.page'
    const requestUri = 'API/PageSign/Index.aspx?'
    const tradeNo = this.randomTradeNo().toString()
    const bankcard = await this.bankcardService.findOne(webSignDto.bankId)
    this.logger.debug(bankcard)
    if (bankcard == null) {
      throw new ApiException('没有此银行卡')
    }

    if (bankcard.userId != userId) {
      throw new ApiException('非本人银行卡')
    }
    const bizContent = {
      // bank_card_no: bankcard.cardNo,
      // bank_card_type: bankcard.cardType,
      // bank_user_name: bankcard.userName,
      bank_type: "0",
      bank_card_no: "6225880134229876",
      bank_user_name: "崔吉龙",
      cert_no: "340321197907014717",
      mobile: "18905170811",
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
    return bizResult.sign_url;
  }

  // 网关签约接口
  async webSignNotify(webSignNotifyeDto: WebSignNotifyDto) {
    this.logger.debug(webSignNotifyeDto)
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
    const bodyString = this.compactJsonToString(body)
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
      // 对公共请求参数进行验证签名，这部分是公用的，所以我们放在这里
      return JSON.parse(decryptedData);
    }
    throw new ApiException('签约请求失败: ' + responseData.msg)
  }

  /* 发送请求的通用接口 */
  async sendCryptoRequest<T>(
    requestUri: string, bizContent: any
  ): Promise<boolean> {


    // 业务参数进行加密
    // 使用支付平台公钥加密bizConent这个json格式的字符串
    const encryptData = publicEncrypt(this.platformPublicKey, Buffer.from(JSON.stringify(bizContent)));

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

  // Creating a function to encrypt string
  encryptString(plaintext, publicKeyFile) {
    const publicKey = fs.readFileSync(publicKeyFile, "utf8");

    // publicEncrypt() method with its parameters
    const encrypted = publicEncrypt(
      publicKey, Buffer.from(plaintext));
    return encrypted.toString("base64");
  }

  // Using a function generateKeyFiles
  generateKeyFiles() {

    const keyPair = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: ''
      }
    });

    // Creating public key file 
    fs.writeFileSync("./public_key", keyPair.publicKey);
    fs.writeFileSync("./private_key", keyPair.privateKey);
  }

  compactJsonToString(data: Object) {
    let sign = '';
    for (let key in data) {
      sign += '&' + key + '=' + data[key]
    }
    return sign.slice(1)
  }
  getPublicX905FromString(str: string) {
    const rawcert = this.stringChunks(str, 64)
    const cert = "-----BEGIN CERTIFICATE-----\n" + rawcert + "\n-----END CERTIFICATE-----";
    return cert
  }

  getPublicPemFromString(str: string) {
    const rawcert = this.stringChunks(str, 64)
    const cert = "-----BEGIN PUBLIC KEY-----\n" + rawcert + "\n-----END PUBLIC KEY-----";
    return cert
  }

  getPrivateFromString(str: string) {
    const rawcert = this.stringChunks(str, 64)
    const cert = "-----BEGIN PRIVATE KEY-----\n" + rawcert + "\n-----END PRIVATE KEY-----";
    return cert
  }

  stringChunks(str, chunkSize) {
    chunkSize = (typeof chunkSize === "undefined") ? 140 : chunkSize;
    let resultString = "";

    if (str.length > 0) {
      let resultArray = [];
      let chunk = "";
      for (let i = 0; i < str.length; i = (i + chunkSize)) {
        chunk = str.substring(i, i + chunkSize);
        if (chunk.trim() != "") {
          resultArray.push(chunk);
        }
      }
      if (resultArray.length) {
        resultString = resultArray.join("\n");
      }
    } else {
      resultString = str;
    }

    return resultString;
  }
}


