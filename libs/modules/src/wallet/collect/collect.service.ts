import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { ReqAddRechargeCollectDto, ReqCollectRechargeNotifyDto, ListRechargeCollectDto } from './dto/req-rechargecollect-list.dto';
import { RechargeCollect } from './entities/rechage-collect.entity';
import { Account } from '@app/modules/account/entities/account.entity';
import { SysConfigService } from '@app/modules/system/sys-config/sys-config.service';
import { SYSCONF_COLLECTION_FEE_KEY, SYSCONF_MARKET_FEE_KEY, SYSCONF_WALLET_COLLECT_FEE_KEY } from '@app/common/contants/sysconfig.contants';
import { AddressService } from '../address/address.service';
import { CurrencyService } from '@app/modules/currency/currency.service';
import { ApiException } from '@app/common/exceptions/api.exception';
import { AccountFlow, AccountFlowType, AccountFlowDirection } from '@app/modules/account/entities/account-flow.entity';
import { PaginationDto } from '@app/common/dto/pagination.dto';

@Injectable()
export class CollectService {
    logger = new Logger(CollectService.name)
    constructor(
        @InjectRepository(RechargeCollect) private readonly collectRepository: Repository<RechargeCollect>,
        private readonly sysconfigService: SysConfigService,
        private readonly addressService: AddressService,
        private readonly currencyService: CurrencyService,
        ) { }

    /* 分页查询 */
    async list(listRechargecollect: ListRechargeCollectDto, paginationDto: PaginationDto): Promise<PaginatedDto<RechargeCollect>> {
        let where: FindOptionsWhere<RechargeCollect> = {}
        if (listRechargecollect.address) {
            where.from = Like(`%${listRechargecollect.address}%`)
        }
        if (listRechargecollect.txid) {

            where.txid = Like(`%${listRechargecollect.txid}%`)
        }
        if (listRechargecollect.addressType) {
            where.addressType = listRechargecollect.addressType
        }
        if (listRechargecollect.confirmState) {
            where.confirmState = listRechargecollect.confirmState
        }
        const result = await this.collectRepository.findAndCount({
            // select: ['id', 'txid', 'type', 'userId', 'confirmState', 'status'],
            where,
            relations: {currency: true},
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

    /* 分页查询 */
    async mylist(userId: number, listRechargecollect: ListRechargeCollectDto, paginationDto: PaginationDto): Promise<PaginatedDto<RechargeCollect>> {
        let where: FindOptionsWhere<RechargeCollect> = {}
        if (listRechargecollect.address) {
            where.from = Like(`%${listRechargecollect.address}%`)
        }
        if (listRechargecollect.txid) {

            where.txid = Like(`%${listRechargecollect.txid}%`)
        }
        if (listRechargecollect.addressType) {
            where.addressType = listRechargecollect.addressType
        }
        if (listRechargecollect.confirmState) {
            where.confirmState = listRechargecollect.confirmState
        }
        where.userId = userId

        const result = await this.collectRepository.findAndCount({
            // select: ['id', 'txid', 'type', 'userId', 'confirmState', 'status'],
            where,
            relations: {currency: true},
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

    // 钱包充值通知
    async collectionRechargeNotify(rechargeNotifyDto: ReqCollectRechargeNotifyDto) {
        this.logger.debug("Recharge Notice: " + JSON.stringify(rechargeNotifyDto))
        // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
        return await this.collectRepository.manager.transaction(async manager => {
            let marketRatio = Number(0)
            const currency = await this.currencyService.findOne(rechargeNotifyDto.currencyId)
            const collect = await manager.findOneBy(RechargeCollect, {txid: rechargeNotifyDto.txid})
            if(collect)
                throw new ApiException(`Collect of ${rechargeNotifyDto.txid} already exist.`)
            if (currency) {
                const address = await this.addressService.findAddress(rechargeNotifyDto.to, rechargeNotifyDto.addressType)
                if(!address)
                    throw new ApiException("Address is not exist.")
                // const configString = await this.sysconfigService.getValue(SYSCONF_WALLET_COLLECT_FEE_KEY)
                // if (configString) {
                //     const configValue = JSON.parse(configString)
                //     this.logger.debug('collection config ratio ' + configValue.ratio)
                //     marketRatio = Number(configValue.ratio)
                // }

                // let rechargeFee = rechargeNotifyDto.amount * marketRatio
                let currencyId = rechargeNotifyDto.currencyId
                await manager.increment(Account, { userId: address.userId, currencyId }, "usable", rechargeNotifyDto.amount)
                // await manager.increment(Account, { userId: 1, currencyId}, "usable", rechargeFee)

                const accountFlow = new AccountFlow()
                accountFlow.type = AccountFlowType.Recharge
                accountFlow.direction = AccountFlowDirection.In
                accountFlow.userId = address.userId
                accountFlow.amount = rechargeNotifyDto.amount
                accountFlow.currencyId = currencyId
                accountFlow.currencyName = currency.symbol
                accountFlow.balance = 0
                await manager.save(accountFlow)

                const reqAddRechargeCollectDto:ReqAddRechargeCollectDto = {
                    ...rechargeNotifyDto,
                    feeState: 1,
                    fee: 0.0,
                    state: 1,
                    confirmState: 1,
                    userId: address.userId
                }
                await manager.save(RechargeCollect, reqAddRechargeCollectDto) // 支付完成
            }
        })
    }
}
