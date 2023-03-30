import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { ReqAddRechageCollectDto, ReqCollectRechageNotifyDto, ReqRechargeCollectListDto } from './dto/req-rechargecollect-list.dto';
import { RechargeCollect } from './entities/rechage-collect.entity';
import { CollectionService } from '@app/modules/collection/collection.service';
import { Account } from '@app/modules/account/entities/account.entity';
import { SysConfigService } from '@app/modules/system/sys-config/sys-config.service';
import { SYSCONF_COLLECTION_FEE_KEY, SYSCONF_MARKET_FEE_KEY } from '@app/common/contants/sysconfig.contants';
import { AddressService } from '../address/address.service';

@Injectable()
export class CollectService {
    logger = new Logger(CollectionService.name)
    constructor(
        @InjectRepository(RechargeCollect) private readonly collectRepository: Repository<RechargeCollect>,
        private readonly sysconfigService: SysConfigService,
        private readonly addressService: AddressService
        ) { }
    /* 分页查询 */
    async list(reqRechargecollectList: ReqRechargeCollectListDto): Promise<PaginatedDto<RechargeCollect>> {
        let where: FindOptionsWhere<RechargeCollect> = {}
        if (reqRechargecollectList.address) {
            where.address = Like(`%${reqRechargecollectList.address}%`)
        }
        if (reqRechargecollectList.txid) {

            where.txid = Like(`%${reqRechargecollectList.txid}%`)
        }
        if (reqRechargecollectList.currencyType) {
            where.currencyType = reqRechargecollectList.currencyType
        }
        if (reqRechargecollectList.confirmState) {
            where.confirmState = reqRechargecollectList.confirmState
        }
        const result = await this.collectRepository.findAndCount({
            // select: ['id', 'txid', 'type', 'userId', 'confirmState', 'status'],
            where,
            skip: reqRechargecollectList.skip,
            take: reqRechargecollectList.take
        })
        return {
            rows: result[0],
            total: result[1]
        }
    }

    // 钱包充值通知
    async collectionRechargeNotify(rechargeNotifyDto: ReqCollectRechageNotifyDto) {
        try {
            this.logger.debug("Recharge Notice: " + JSON.stringify(rechargeNotifyDto))
            // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
            await this.collectRepository.manager.transaction(async manager => {
                let marketRatio = Number(0)
                const address = await this.addressService.findAddress(rechargeNotifyDto.address, rechargeNotifyDto.currencyType)
                if (address) {
                    
                    const configString = await this.sysconfigService.getValue(SYSCONF_COLLECTION_FEE_KEY)
                    if (configString) {
                        const configValue = JSON.parse(configString)
                        this.logger.debug('collection config ratio ' + configValue.ratio)
                        marketRatio = rechargeNotifyDto.amount * Number(configValue.ratio)
                    }

                    if (marketRatio > 1.0 || marketRatio < 0.0) {
                        marketRatio = 0.0
                    }
                    let marketFee = rechargeNotifyDto.amount * marketRatio
    
                    await manager.increment(Account, { userId: address.userId }, "usable", rechargeNotifyDto.amount - marketFee)
                    await manager.increment(Account, { userId: 1 }, "usable", marketFee)

                    const reqAddRechageCollectDto:ReqAddRechageCollectDto = {
                        ...rechargeNotifyDto,
                        state: 1,
                        confirmState: 1,
                    }
                    await manager.save(RechargeCollect, reqAddRechageCollectDto) // 支付完成
                }
            })
        } catch (error) {
            this.logger.error("Payment Notice : " + error)
            return {code: 500, data: {code:'FAIL', message: '失败'}}
        }

        return {code: 200, data: null}
    }
}
