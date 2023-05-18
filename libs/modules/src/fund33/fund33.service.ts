import { ApiException } from '@app/common/exceptions/api.exception';
import { SharedService } from '@app/shared';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import * as querystring from 'querystring';
import strRandom from 'string-random';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { LoginCardDto, ModifyPincodeDto, QueryBalanceDto, QueryRechargeDto } from './dto/create-fund33.dto';
import { Fund33QueryBalance, Fund33QueryTransaction, Fund33QueryUNTransaction, Fund33RechargeDto, Fund33Response } from './dto/response-fund33.dto';
import { Account } from '../account/entities/account.entity';
import { KycCertifyInfo } from '../kyc/entities/kyc.entity';
import { Bankcard } from 'apps/giftcard/src/bankcard/entities/bankcard.entity';
import { AccountFlow, AccountFlowType, AccountFlowDirection } from '../account/entities/account-flow.entity';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { BANKCARD_BALANCE_KEY } from '@app/common/contants/redis.contant';

@Injectable()
export class Fund33Service {

  baseUrl: string
  appKey: string
  appSecret: string
  secret: string

  logger = new Logger(Fund33Service.name)

  constructor(
    @InjectRepository(Bankcard) private readonly bankcardRepository: Repository<Bankcard>,
    @InjectRedis() private readonly redis: Redis,
    private readonly httpService: HttpService,
    private readonly sharedService: SharedService,
    private readonly configService: ConfigService,
  ) {
    this.secret = this.configService.get<string>('platform.secret')
    this.baseUrl = this.configService.get<string>('fund33.baseUrl')
    this.appKey = this.configService.get<string>('fund33.appKey')
    this.appSecret = this.configService.get<string>('fund33.appSecret')
  }

  /**
   * 签名
   */
  sign(body: any) {

    const signString = this.sharedService.compactJsonToString(body)
    this.logger.debug(signString)
    // const signString = 'amount=1&appId=YTUvZeeOdx&appSecret=owfwFkDnlCuiUTYz&callbackUrl=http://127.0.0.1:8921/api/callback/test&itemId=100001&outOrderId=2975857684279803&timestamp=20200717133601001&uuid=18898810602'
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
  async loginCard(loginCardDto: LoginCardDto, userId: number) {

    const cardId = loginCardDto.cardId

    const bankcard = await this.bankcardRepository.findOneBy({userId: userId, id: cardId})
    if(!bankcard)
      throw new ApiException("不拥有此银行卡")

    const cardNumber = bankcard.cardNo
    this.logger.debug('pinCode encrypt ' + bankcard.pinCode)
    const cardPinCode = this.sharedService.aesDecrypt(bankcard.pinCode, this.secret)
    this.logger.debug(cardPinCode)
    const requestUri = '/api/login'
    // 对所有的原始参数进行签名
    let queryParams = {
      cardNumber: bankcard.cardNo,
      pin: cardPinCode
    }

    const timestamp = moment().unix()*1000 + moment().milliseconds()
    // const timestamp = '20230324133601001'
    const nonce = this.sharedService.generateNonce(16)

    let body1 = {
      appKey: this.appKey,
      appSecret: this.appSecret,
      cardNumber: cardNumber,
      nonce: nonce,
      pin: cardPinCode,
      timestamp: timestamp.toString(),
    }

    let body = {
      appKey: this.appKey,
      cardNumber: cardNumber,
      nonce: nonce,
      pin: cardPinCode,
      sign: undefined,
      timestamp: timestamp.toString(),
    }

    this.logger.debug(body1)
    const signContent = this.sign(body1)
    body.sign = signContent
    let options = {
      headers: {
          "Content-Type": "application/json"
      },
    }

    const remoteUrl = this.baseUrl + requestUri
    this.logger.debug(remoteUrl)
    this.logger.debug(body1)
    let res = await this.httpService.axiosRef.post<Fund33Response<boolean>>(remoteUrl, body, options);
    const responseData = res.data

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
  async queryBalance(queryBalanceDto: QueryBalanceDto, userId: number) {

    const requestUri = '/api/card/query/balance'
    // 对所有的原始参数进行签名

    const cardId = queryBalanceDto.cardId

    const bankcardBalanceKey = BANKCARD_BALANCE_KEY + ":" +  cardId
    const balance = await this.redis.get(bankcardBalanceKey)
    if(balance != undefined && balance != null) {
      return balance
    }
    
    const bankcard = await this.bankcardRepository.findOneBy({userId: userId, id: cardId})
    if(!bankcard)
      throw new ApiException("不拥有此银行卡")

    let queryParams = {
      cardNumber: bankcard.cardNo,
    }

    const timestamp = moment().unix()*1000 + moment().milliseconds()
    const nonce = this.sharedService.generateNonce(16)
    let body = {
      appKey: this.appKey,
      appSecret: this.appSecret,
      cardNumber: bankcard.cardNo,
      nonce: nonce,
      sign: undefined,
      timestamp: timestamp,
    }

    const signContent = this.sign(body)
    body.sign = signContent
    body.appSecret = undefined

    let options = {
      headers: {
          "Content-Type": "application/json"
      },
    }

    // this.logger.debug(JSON.stringify(body))
    const remoteUrl = this.baseUrl + requestUri
    // this.logger.debug(remoteUrl)
    // this.logger.debug(JSON.stringify(body))
    let res = await this.httpService.axiosRef.post<Fund33Response<Fund33QueryBalance>>(remoteUrl, body, options);
    const responseData = res.data
    // const responseData = await this.sharedService.xmlToJson<BankCertifyResponse>(res.data)

    this.logger.debug(responseData)
    if (responseData.success == true) {
        // const decryptedData = key2.decrypt(responseData.encrypt_data, 'utf8');
        // decode cardnumber
        const backNumber = responseData.data.cardNumber
        const actualAmount = responseData.data.actualAmount
        bankcard.balance = parseFloat(actualAmount)
        await this.bankcardRepository.save(bankcard)
        await this.redis.set(bankcardBalanceKey, bankcard.balance, 'EX', 60 * 5)

        return bankcard.balance
    }
    throw new ApiException('发送请求失败: ' + responseData.msg)
  }

  /**
   * 修改银行卡密码
   */
  async modifyPincode(modifypincodeDto: ModifyPincodeDto, userId: number) {

    const requestUri = '/api/card/modify/PIN'
    // 对所有的原始参数进行签名

    const cardId = modifypincodeDto.cardId
    const bankcard = await this.bankcardRepository.findOneBy({userId: userId, id: cardId})
    if(!bankcard)
      throw new ApiException("不拥有此银行卡")

    const timestamp = moment().unix()*1000 + moment().milliseconds()
    const nonce = this.sharedService.generateNonce(16)
    let body = {
      appKey: this.appKey,
      appSecret: this.appSecret,
      cardNumber: bankcard.cardNo,
      newPin: modifypincodeDto.newPin,
      nonce: nonce,
      pin: modifypincodeDto.oldPin,
      sign: undefined,
      timestamp: timestamp,
    }

    const signContent = this.sign(body)
    body.sign = signContent
    body.appSecret = undefined

    let options = {
      headers: {
          "Content-Type": "application/json"
      },
    }

    // this.logger.debug(JSON.stringify(body))
    const remoteUrl = this.baseUrl + requestUri
    // this.logger.debug(remoteUrl)
    // this.logger.debug(JSON.stringify(body))
    let res = await this.httpService.axiosRef.post<Fund33Response<any>>(remoteUrl, body, options);
    const responseData = res.data
    // const responseData = await this.sharedService.xmlToJson<BankCertifyResponse>(res.data)

    this.logger.debug(responseData)
    if (responseData.success == true) {
        // const decryptedData = key2.decrypt(responseData.encrypt_data, 'utf8');
        // decode cardnumber
        // this.bankcardRepository.save(bankcard)
        
        return bankcard.balance
    }
    throw new ApiException('发送请求失败: ' + responseData.msg)
  }

  async uploadKycInfo(kycInfo:KycCertifyInfo) {
    const requestUri = '/api/kyc/apply'
    // 对所有的原始参数进行签名

    const timestamp = moment().unix()*1000 + moment().milliseconds()
    const nonce = this.sharedService.generateNonce(16)
    let bodyRaw = {
      appKey: this.appKey,
      appSecret: this.appSecret,
      ...kycInfo,
      nonce: nonce,
      sign: undefined,
      timestamp: timestamp,
    }

    bodyRaw.faceImage = undefined
    bodyRaw.backImage = undefined
    bodyRaw.passImage = undefined
    bodyRaw.signImage = undefined

    const body = this.sharedService.sortObject(bodyRaw)

    const signContent = this.sign(body)
    body.sign = signContent
    body.appSecret = undefined
    if(kycInfo.faceImage)
      body.faceImage = await this.sharedService.imageToBase64(kycInfo.faceImage)
    if(kycInfo.backImage)
      body.backImage = await this.sharedService.imageToBase64(kycInfo.backImage)
    if(kycInfo.passImage)
      body.passImage = await this.sharedService.imageToBase64(kycInfo.passImage)
    if(kycInfo.signImage)
      body.signImage = await this.sharedService.imageToBase64(kycInfo.signImage)

    let options = {
      headers: {
          "Content-Type": "application/json"
      },
    }

    // this.logger.debug(JSON.stringify(body))
    const remoteUrl = this.baseUrl + requestUri
    // this.logger.debug(remoteUrl)
    // this.logger.debug(JSON.stringify(body))
    let res = await this.httpService.axiosRef.post<Fund33Response<any>>(remoteUrl, body, options);
    const responseData = res.data
    // const responseData = await this.sharedService.xmlToJson<BankCertifyResponse>(res.data)

    this.logger.debug(responseData)
    if (responseData.success == true) {
        // const decryptedData = key2.decrypt(responseData.encrypt_data, 'utf8');
        // decode cardnumber
        
        return 
    }
    throw new ApiException('UploadKycInfo error: ' + responseData.msg)
  }

  /**
   * 查询交易记录
   * 备注：最大查询3个月内交易
   */
  async queryTransaction(cardNumber: string, startDate: string, endDate: string) {
    const requestUri = '/api/query/transaction'
    // 对所有的原始参数进行签名
    const timestamp = moment().unix()*1000
    let body = {
      appSecret: this.appSecret,
      cardNumber: cardNumber,
      endDate: endDate,
      nonce: this.sharedService.generateNonce(16),
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
    // this.logger.debug(querystring.stringify(body))
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

    const timestamp = moment().unix()*1000
    let body = {
      appSecret: this.appSecret,
      cardNumber: cardNumber,
      endDate: endDate,
      nonce: this.sharedService.generateNonce(16),
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
    // this.logger.debug(querystring.stringify(body))
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
