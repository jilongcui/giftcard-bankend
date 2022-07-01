import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { FindConditions, Like, Repository } from 'typeorm';
import { ReqRechargeCollectListDto } from './dto/req-rechargecollect-list.dto';
import { RechargeCollect } from './entities/rechage-collect.entity';

@Injectable()
export class CollectService {
    constructor(@InjectRepository(RechargeCollect) private readonly collectRepository: Repository<RechargeCollect>) { }
    /* 分页查询 */
    async list(reqRechargecollectList: ReqRechargeCollectListDto): Promise<PaginatedDto<RechargeCollect>> {
        let where: FindConditions<RechargeCollect> = {}
        if (reqRechargecollectList.address) {
            where.address = Like(`%${reqRechargecollectList.address}%`)
        }
        if (reqRechargecollectList.txid) {
            where.txid = reqRechargecollectList.txid
        }
        if (reqRechargecollectList.type) {
            where.type = reqRechargecollectList.type
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
}
