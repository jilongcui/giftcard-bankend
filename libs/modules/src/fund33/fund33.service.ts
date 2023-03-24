import { ApiException } from '@app/common/exceptions/api.exception';
import { SharedService } from '@app/shared';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as querystring from 'querystring';
import { CreateFund33Dto } from './dto/create-fund33.dto';
import { Fund33QueryBalance, Fund33QueryTransaction, Fund33QueryUNTransaction, Fund33Response } from './dto/response-fund33.dto';
import { UpdateFund33Dto } from './dto/update-fund33.dto';

@Injectable()
export class Fund33Service {

  baseUrl: string
  appKey: string
  appSecret: string

  logger = new Logger(Fund33Service.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly sharedService: SharedService,
    private readonly configService: ConfigService,
    ) {
    this.baseUrl = this.configService.get<string>('fund33.baseUrl')
    this.appKey = this.configService.get<string>('fund33.appKey')
    this.appSecret = this.configService.get<string>('fund33.appSecret')
  }

  /**
   * 签名
   */
  sign(body: any) {

    const signString = this.sharedService.compactJsonToString(body).toLowerCase()
    this.logger.debug(signString)
    const signContent = this.sharedService.md5Sign(signString)
    this.logger.debug(signContent)
    return signContent
  }

  /**
   * 解密
   */
  decrypto() {

  }

  /**
   * 登录或者校验卡号
   */
  async login(cardNumber: string, pin: string) {

    const requestUri = '/api/login'
    // 对所有的原始参数进行签名
    let queryParams = {
      cardNumber: cardNumber,
      pin: pin
    }

    const timestamp = moment().unix()
    let body = {
      appSecret: this.appSecret,
      cardNumber: cardNumber,
      nonce: '1135454',
      pin: pin,
      sign: undefined,
      timestamp: timestamp,
    }

    const signContent = this.sign(body)
    body.sign = signContent

    let options = {
      headers: {
          "Content-Type": "application/json"
      },
      body: body
    }

    const remoteUrl = this.baseUrl + requestUri
    this.logger.debug(querystring.stringify(body))
    let res = await this.httpService.axiosRef.post<Fund33Response<boolean>>(remoteUrl, options);
    const responseData = res.data
    // const responseData = await this.sharedService.xmlToJson<BankCertifyResponse>(res.data)

    this.logger.debug(responseData)
    if (responseData.success == true) {
        // const decryptedData = key2.decrypt(responseData.encrypt_data, 'utf8');
        this.logger.debug(responseData.msg)
        // 验证签名
        // const verify = createVerify('RSA-SHA1');
        // verify.write(decryptedData);
        // verify.end();
        // const verifyOk = verify.verify(this.platformPublicKey, responseData.sign, 'base64');
        // this.logger.debug(verifyOk)
        // return querystring.parse(decryptedData)
        return responseData
    }
    throw new ApiException('发送请求失败: ' + responseData.msg)
  }

  /**
   * 查询当前卡上的余额
   */
  async queryBalance(cardNumber: string) {

    const requestUri = '/api/query/balance'
    // 对所有的原始参数进行签名
    let queryParams = {
      cardNumber: cardNumber,
    }

    const timestamp = moment().unix()
    let body = {
      appSecret: this.appSecret,
      cardNumber: cardNumber,
      nonce: '1135454',
      sign: undefined,
      timestamp: timestamp,
    }

    const signContent = this.sign(body)
    body.sign = signContent

    let options = {
      headers: {
          "Content-Type": "application/json"
      },
      body: body
    }

    const remoteUrl = this.baseUrl + requestUri
    this.logger.debug(querystring.stringify(body))
    let res = await this.httpService.axiosRef.post<Fund33Response<Fund33QueryBalance>>(remoteUrl, options);
    const responseData = res.data
    // const responseData = await this.sharedService.xmlToJson<BankCertifyResponse>(res.data)

    this.logger.debug(responseData)
    if (responseData.success == true) {
        // const decryptedData = key2.decrypt(responseData.encrypt_data, 'utf8');
        this.logger.debug(responseData.msg)
        // 验证签名
        // const verify = createVerify('RSA-SHA1');
        // verify.write(decryptedData);
        // verify.end();
        // const verifyOk = verify.verify(this.platformPublicKey, responseData.sign, 'base64');
        // this.logger.debug(verifyOk)
        // return querystring.parse(decryptedData)
        return responseData
    }
    throw new ApiException('发送请求失败: ' + responseData.msg)
  }
  

  /**
   * 查询交易记录
   * 备注：最大查询3个月内交易
   */
  async queryTransaction(cardNumber: string, startDate: string, endDate: string) {
    const requestUri = '/api/query/transaction'
    // 对所有的原始参数进行签名
    const timestamp = moment().unix()
    let body = {
      appSecret: this.appSecret,
      cardNumber: cardNumber,
      endDate: endDate,
      nonce: '1135454',
      sign: undefined,
      startDate: startDate,
      timestamp: timestamp,
    }

    const signContent = this.sign(body)
    body.sign = signContent

    let options = {
      headers: {
          "Content-Type": "application/json"
      },
      body: body
    }

    const remoteUrl = this.baseUrl + requestUri
    this.logger.debug(querystring.stringify(body))
    let res = await this.httpService.axiosRef.post<Fund33Response<Fund33QueryTransaction>>(remoteUrl, options);
    const responseData = res.data
    // const responseData = await this.sharedService.xmlToJson<BankCertifyResponse>(res.data)

    this.logger.debug(responseData)
    if (responseData.success == true) {
        // const decryptedData = key2.decrypt(responseData.encrypt_data, 'utf8');
        this.logger.debug(responseData.msg)
        // 验证签名
        // const verify = createVerify('RSA-SHA1');
        // verify.write(decryptedData);
        // verify.end();
        // const verifyOk = verify.verify(this.platformPublicKey, responseData.sign, 'base64');
        // this.logger.debug(verifyOk)
        // return querystring.parse(decryptedData)
        return responseData
    }
    throw new ApiException('发送请求失败: ' + responseData.msg)
  }

  /**
   * 查询待结算的交易记录
   * 备注：最大查询3个月内交易
   */

  async queryUnTransaction(cardNumber: string, startDate: string, endDate: string) {
    const requestUri = '/api/query/un/transaction'
    // 对所有的原始参数进行签名

    const timestamp = moment().unix()
    let body = {
      appSecret: this.appSecret,
      cardNumber: cardNumber,
      endDate: endDate,
      nonce: '1135454',
      sign: undefined,
      startDate: startDate,
      timestamp: timestamp,
    }

    const signContent = this.sign(body)
    body.sign = signContent

    let options = {
      headers: {
          "Content-Type": "application/json"
      },
      body: body
    }

    const remoteUrl = this.baseUrl + requestUri
    this.logger.debug(querystring.stringify(body))
    let res = await this.httpService.axiosRef.post<Fund33Response<Fund33QueryUNTransaction>>(remoteUrl, options);
    const responseData = res.data
    // const responseData = await this.sharedService.xmlToJson<BankCertifyResponse>(res.data)

    this.logger.debug(responseData)
    if (responseData.success == true) {
        // const decryptedData = key2.decrypt(responseData.encrypt_data, 'utf8');
        this.logger.debug(responseData.msg)
        // 验证签名
        // const verify = createVerify('RSA-SHA1');
        // verify.write(decryptedData);
        // verify.end();
        // const verifyOk = verify.verify(this.platformPublicKey, responseData.sign, 'base64');
        // this.logger.debug(verifyOk)
        // return querystring.parse(decryptedData)
        return responseData
    }
    throw new ApiException('发送请求失败: ' + responseData.msg)
  }
}
