import { ApiException } from '@app/common/exceptions/api.exception';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as querystring from 'querystring';
import { EntityManager, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedService } from '@app/shared';

import { BankCertifyBizDetail, ConfirmWithdrawDto, CreateWithdrawDto, ListMyWithdrawDto, ListWithdrawDto, QueryBankCardInfoDto, ReqBankCertifyDto, ReqWithdrawDto, WithdrawWithCardDto } from '../fund/dto/request-fund.dto';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Account } from '../account/entities/account.entity';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { RES_CODE_SUCCESS } from '../fund/fund.const';
import { Withdraw } from './entities/withdraw.entity';
import { WithdrawFlow } from './entities/withdraw-flow.entity';
import { Fund33RechargeDto, Fund33Response } from './dto/response-fund33.dto';
import { QueryRechargeDto } from './dto/create-fund33.dto';
import { BankcardService } from 'apps/giftcard/src/bankcard/bankcard.service';
import { Bankcard } from 'apps/giftcard/src/bankcard/entities/bankcard.entity';
import { CreateProfitRecordDto } from '../profit_record/dto/create-profit_record.dto';
import { ProfitRecord, ProfitType } from '../profit_record/entities/profit_record.entity';
import { ProfitRecordService } from '../profit_record/profit_record.service';
import { AccountFlow, AccountFlowType, AccountFlowDirection } from '../account/entities/account-flow.entity';

const NodeRSA = require('node-rsa');
var key = new NodeRSA({
    // encryptionScheme: 'pkcs1', // Here is ignored after importing the key
    ENVIRONMENT: 'node',
});
var key2 = new NodeRSA({
    ENVIRONMENT: 'node',
});
@Injectable()
export class WithdrawService {
    logger = new Logger(WithdrawService.name)
    baseCertUrl: string
    basePayUrl: string
    platformPublicKey: string
    merchSecretKey: string
    merchPublicKey: string
    platformCert3DESKey: string
    platformCertMD5Key: string
    platformPay3DESKey: string
    platformPayMD5Key: string
    merchId: string
    platformAddress: string

    baseUrl: string
    appKey: string
    appSecret: string
    secret: string

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly sharedService: SharedService,
        private readonly profitRecordService: ProfitRecordService,
        @InjectRepository(Withdraw) private readonly withdrawRepository: Repository<Withdraw>,
        @InjectRepository(Account) private readonly accountRepository: Repository<Account>,
        @InjectRepository(Bankcard) private readonly bankcardRepository: Repository<Bankcard>,
        @InjectRedis() private readonly redis: Redis,
    ) {
        this.baseCertUrl = this.configService.get<string>('fund.baseCertUrl')
        this.basePayUrl = this.configService.get<string>('fund.basePayUrl')
        this.merchId = this.configService.get<string>('fund.merchId')
        this.secret = this.configService.get<string>('platform.secret')
        this.baseUrl = this.configService.get<string>('fund33.baseUrl')
        this.appKey = this.configService.get<string>('fund33.appKey')
        this.appSecret = this.configService.get<string>('fund33.appSecret')
        this.platformPublicKey = this.sharedService.getPublicPemFromString(this.configService.get<string>('payment.platformPublicKey'))
        this.merchSecretKey = this.sharedService.getPrivateFromString(this.configService.get<string>('payment.merchSecretKey'))
        this.merchPublicKey = this.sharedService.getPublicPemFromString(this.configService.get<string>('payment.merchPublicKey'))
        this.logger.debug(this.merchId)
        this.platformAddress = this.configService.get<string>('crichain.platformAddress')

        this.logger.debug(this.platformPublicKey)
        this.platformCert3DESKey = this.configService.get<string>('fund.platformCert3DESKey')
        this.platformCertMD5Key = this.configService.get<string>('fund.platformCertMD5Key')

        this.platformPay3DESKey = this.configService.get<string>('fund.platformPay3DESKey')
        this.platformPayMD5Key = this.configService.get<string>('fund.platformPayMD5Key')

        this.logger.debug(this.platformCert3DESKey)
        this.logger.debug(this.platformCertMD5Key)

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

    // 创建提现请求
    async createWithdrawRequest(createWithdrawDto: CreateWithdrawDto, userId: number) {
        const bankcard = await this.bankcardRepository.findOne({where: {id:createWithdrawDto.bankcardId}, relations: { user: true, cardinfo: true, order: true}})
        this.logger.debug(bankcard)
        // if (bankcard.signNo === undefined || bankcard.signNo === '') {
        //     throw new ApiException('此银行卡没有实名')
        // }
        if (bankcard.status === '0' || bankcard.status === '2') {
            throw new ApiException('此银行卡未绑定')
        }
        
        let amount = createWithdrawDto.amount

        const ratio = Number(bankcard.cardinfo.info.exchangeToCardRatio)
        const fee = amount * ratio
        const realAmount = amount + fee
        this.logger.debug(ratio)

        if (createWithdrawDto.amount <= fee) {
            throw new ApiException('提现金额低于手续费')
        }

        return await this.withdrawRepository.manager.transaction(async manager => {
            const result = await manager.decrement(Account, { user: { userId: userId }, usable: MoreThanOrEqual(realAmount) }, "usable", realAmount);
            if (!result.affected) {
                throw new ApiException('创建提现请求失败')
            }

            const result2 = await manager.increment(Account, { user: { userId: userId } }, "freeze", realAmount);
            if (!result2.affected) {
                throw new ApiException('创建提现请求失败')
            }

            const accountFlow = new AccountFlow()
            accountFlow.type = AccountFlowType.BankWithdraw
            accountFlow.direction = AccountFlowDirection.Out
            accountFlow.userId = userId
            accountFlow.amount = realAmount
            accountFlow.currencyId = 2
            accountFlow.currencyName = 'HKD'
            accountFlow.balance = 0
            await manager.save(accountFlow)

            const withdraw = new Withdraw()
            withdraw.type = '1' // 银行卡提现
            withdraw.status = '0' // 待审核
            withdraw.bankcardId = bankcard.id
            withdraw.cardNo = bankcard.cardNo
            withdraw.userId = userId
            withdraw.totalPrice = realAmount
            withdraw.totalFee = fee
            withdraw.realPrice = amount
            // withdraw.count = 1
            // withdraw.merchBillNo = this.randomBillNo()
            // withdraw.merchBatchNo = this.randomBatchNo()
            const withdraw2 = await manager.save(withdraw)

            const withdrawFlow = new WithdrawFlow()
            withdrawFlow.step = '0'
            withdrawFlow.status = '1'
            withdrawFlow.remark = '发起提现'
            withdrawFlow.withdrawId = withdraw2.id
            await manager.save(withdrawFlow)
            withdraw2.bankcard = bankcard
            withdraw2.bankcard.user = undefined
            withdraw2.bankcard.signTradeNo = undefined
            return withdraw2
        })
    }

    // 确认提现请求
    async confirmWithdrawRequest(confirmWithdrawDto: ConfirmWithdrawDto, userId: number) {
        const withdraw = await this.withdrawRepository.findOneBy({ id: confirmWithdrawDto.withdrawId })
        if (withdraw === null) {
            throw new ApiException('提币记录不存在')
        }
        if (withdraw.status !== '0') {
            throw new ApiException('提币状态不对')
        }

        return await this.withdrawRepository.manager.transaction(async manager => {
            withdraw.status = '1' // 已审核
            await manager.save(withdraw)

            const withdrawFlow = new WithdrawFlow()
            withdrawFlow.step = '1'
            withdrawFlow.status = '1'
            withdrawFlow.remark = '审核通过'
            withdrawFlow.withdrawId = withdraw.id
            await manager.save(withdrawFlow)

            // toFix
            const bankcard = await this.bankcardRepository.findOne({where: {id:withdraw.bankcardId}, relations: { user: true, cardinfo: true, order: true}})
            // this.logger.debug(bankcard)
            if (bankcard === null) {
                throw new ApiException('此银行卡没有实名')
            }
            if (bankcard.status === '0' || bankcard.status === '2') {
                throw new ApiException('此银行卡未绑定')
            }
            const profitRecordDto = new ProfitRecord()
            profitRecordDto.type = ProfitType.WithdrawToCardFee
            profitRecordDto.content = bankcard.cardNo,
            profitRecordDto.userId = bankcard.userId,
            profitRecordDto.amount = withdraw.realPrice,
            profitRecordDto.fee = withdraw.totalFee,
            profitRecordDto.txid = 'withdrawId: ' + withdraw.id
            await manager.save(profitRecordDto)

            await this.doWithdrawWithCard(bankcard, withdraw)
        })
        
    }

    /**
     * 给银行卡充值
     */
    async doWithdrawWithCard(bankcard: Bankcard, withdraw: Withdraw) {

        const requestUri = '/api/card/top/up'
        // 对所有的原始参数进行签名

        const timestamp = moment().unix()*1000 + moment().milliseconds()
        const nonce = this.sharedService.generateNonce(16)
        let body = {
            amount: withdraw.realPrice.toString(),
            appKey: this.appKey,
            appSecret: this.appSecret,
            cardNumber: withdraw.cardNo,
            merOrderNo: this.sharedService.generateNonce(8),
            nonce: nonce,
            // notifyUrl: '',
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
        // this.logger.debug(querystring.stringify(body))
        let res = await this.httpService.axiosRef.post<Fund33Response<Fund33RechargeDto>>(remoteUrl, body, options);
        const responseData = res.data

        this.logger.debug(responseData)
        if (responseData.success == true) {
            const backNumber = responseData.data.cardNumber
            const settleAmount = responseData.data.settleAmount
            bankcard.balance = bankcard.balance + parseFloat(settleAmount)

            await this.bankcardRepository.manager.transaction(async manager => {
                const result2 = await manager.decrement(Account, { userId: bankcard.userId, currencyId:2}, "freeze", parseFloat(settleAmount));
            })
            return await this.bankcardRepository.save(bankcard)
            return responseData
        }
        throw new ApiException('发送请求失败: ' + responseData.msg)
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

    async findOne(id: number) {
        return await this.withdrawRepository.findOne({ where: { id }, relations: { bankcard: true, withdrawFlows: true } })
    }

    /* 分页查询 */
    async list(listWithdrawList: ListWithdrawDto, paginationDto: PaginationDto): Promise<PaginatedDto<Withdraw>> {
        let where: FindOptionsWhere<Withdraw> = {}
        let result: any;
        where = {
            ...listWithdrawList
        }

        result = await this.withdrawRepository.findAndCount({
            // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
            where,
            relations: { user: true, bankcard: true },
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
    async mylist(userId: number, listMyWithdrawDto: ListMyWithdrawDto, paginationDto: PaginationDto): Promise<PaginatedDto<Withdraw>> {
        let where: FindOptionsWhere<ListWithdrawDto> = {}
        let result: any;
        where = {
            // ...listMyWithdrawDto,
            userId,
        }

        result = await this.withdrawRepository.findAndCount({
            // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
            where,
            relations: { bankcard: true },
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

    async cancel(id: number, userId: number) {
        let where: FindOptionsWhere<Withdraw> = {}
        let result: any;
        let withdraw = await this.withdrawRepository.findOneBy({ id: id })
        this.logger.debug(id)
        this.logger.debug(JSON.stringify(withdraw))
        if (withdraw.userId !== userId) {
            throw new ApiException("非本人提币")
        }
        // 银行卡提现 - 取消
        if (withdraw.type === '1') {
            await this.withdrawRepository.manager.transaction(async manager => {
                let result = await manager.update(Withdraw, { id: withdraw.id, status: '0' }, { status: '3' }) // Unlocked.
                if (result.affected <= 0) {
                    throw new ApiException("未能取消提币")
                }
                result = await manager.increment(Account, { user: { userId: userId }, }, "usable", withdraw.totalPrice);
                if (!result.affected) {
                    throw new ApiException('未能取消当前提现')
                }
                const result2 = await manager.decrement(Account, { user: { userId: userId } }, "freeze", withdraw.totalPrice);

                const accountFlow = new AccountFlow()
                accountFlow.type = AccountFlowType.BankWithdrawRevert
                accountFlow.direction = AccountFlowDirection.In
                accountFlow.userId = userId
                accountFlow.amount = withdraw.totalPrice
                accountFlow.currencyId = 2
                accountFlow.currencyName = 'HKD'
                accountFlow.balance = 0
                await manager.save(accountFlow)

                this.logger.debug('Success')

                const withdrawFlow = new WithdrawFlow()
                withdrawFlow.step = '1'
                withdrawFlow.status = '2'
                withdrawFlow.remark = '取消提现'
                withdrawFlow.withdrawId = withdraw.id
                await manager.save(withdrawFlow)
            })
        }
    }

    async fail(id: number, userId: number) {
        let where: FindOptionsWhere<Withdraw> = {}
        let result: any;
        let withdraw = await this.withdrawRepository.findOneBy({ id: id })
        // this.logger.debug(id)
        // this.logger.debug(JSON.stringify(withdraw))
        if (withdraw.status !== '0') {
            throw new ApiException("提币状态不对")
        }
        // 银行卡提现 - 审核未通过
        if (withdraw.type === '1') {
            await this.withdrawRepository.manager.transaction(async manager => {
                const result1 = await manager.update(Withdraw, { id: withdraw.id, status: '0' }, { status: '5' }) // Unlocked.
                if (result1.affected <= 0) {
                    throw new ApiException("未能取消提币")
                }
                const result = await manager.increment(Account, { user: { userId: withdraw.userId }, }, "usable", withdraw.totalPrice);
                if (!result.affected) {
                    throw new ApiException('未能拒绝当前提现')
                }
                const result2 = await manager.decrement(Account, { user: { userId: userId } }, "freeze", withdraw.totalPrice);
                const accountFlow = new AccountFlow()
                accountFlow.type = AccountFlowType.BankWithdrawRevert
                accountFlow.direction = AccountFlowDirection.In
                accountFlow.userId = userId
                accountFlow.amount = withdraw.totalPrice
                accountFlow.currencyId = 2
                accountFlow.currencyName = 'HKD'
                accountFlow.balance = 0
                await manager.save(accountFlow)

                this.logger.debug('Success')
                const withdrawFlow = new WithdrawFlow()
                withdrawFlow.step = '1'
                withdrawFlow.status = '2'
                withdrawFlow.remark = '审核未通过'
                withdrawFlow.withdrawId = withdraw.id
                await manager.save(withdrawFlow)
            })
        }
    }

    /*
    // 支付通知
    async fundNotify(cryptoNotifyDto: ReqCryptoNotifyDto) {
        // sign_no 是加密的，我们需要解密
        try {
            // this.logger.debug("fundNotify")
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
            const fundNotify: any = querystring.parse(decryptedData)
            if (fundNotify.status === 'SUCCESS') {
                // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
                await this.withdrawRepository.manager.transaction(async manager => {
                    const orderId = fundNotify.agent_bill_id
                    const order = await manager.findOne(Withdraw, { where: { id: parseInt(orderId), status: '1' }, relations: { user: true, fund: true } })
                    if (!order) return 'ok'
                    await manager.update(Withdraw, { orderId: parseInt(orderId) }, { status: '2' }) // 支付完成
                    await manager.update(Withdraw, { id: parseInt(orderId) }, { status: '2' })
                    if (order.type === '0') {
                        const unpayWithdrawKey = ACTIVITY_USER_ORDER_KEY + ":" + order.activityId + ":" + order.userId
                        await this.doFundComfirmedLv1(order, order.userId, order.user.userName)
                        // 首先读取订单缓存，如果还有未完成订单，那么就直接返回订单。
                        await this.redis.del(unpayWithdrawKey)
                    } else if (order.type === '1') {
                        await this.doFundComfirmedLv2(order, order.userId, order.user.userName)
                    } else if (order.type === '2') {
                        await this.doFundComfirmedRecharge(order.fund, order.userId, order.user.userName)
                    }
                })
            } else {
                this.logger.error("Fund Notice not success.")
                return 'error'
            }
        } catch (error) {
            this.logger.error("Fund Notice : " + error)
            return 'error'
        }

        return 'ok'
    }
    */

    // 交易查询
    async queryFund() {

    }

    private randomBillNo(): string {
        return Math.floor((Math.random() * 9000000000) + 1000000000).toString();
    }

    private randomBatchNo(): string {
        return 'BN' + Math.floor((Math.random() * 900000000) + 100000000).toString();
    }

    private randomTokenId(): number {
        return Math.floor((Math.random() * 999999999) + 1000000000);
    }
}
//
