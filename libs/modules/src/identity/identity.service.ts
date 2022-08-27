import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as CryptoJS from 'crypto-js';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { Identity } from './entities/identity.entity';
import * as querystring from 'querystring';
import { ReqIdentityList } from './dto/req-identity-list.dto';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RealAuthDto } from '@app/chain';

@Injectable()
export class IdentityService {
    remoteUrl: string;
    logger: LoggerService;
    constructor(
        @InjectRedis() private readonly redis: Redis,
        @InjectRepository(Identity) private readonly identityRepository: Repository<Identity>,
        @Inject('CHAIN_SERVICE') private readonly chainClient: ClientProxy,
        private readonly httpService: HttpService,
    ) {
        this.logger = new Logger(IdentityService.name);

        this.remoteUrl = 'https://service-4epp7bin-1300755093.ap-beijing.apigateway.myqcloud.com/release/phone3element';
    }

    findOne(id: number) {
        return this.identityRepository.findOne({ where: { identityId: id }, relations: { user: true } })
    }

    findOneByUser(userId: number) {
        return this.identityRepository.findOne({ where: { user: { userId: userId } }, relations: { user: true } })
    }

    async identityWith3Element(mobile: string, cardId: string, realName: string, userId: number) {
        // let isIdentify = true;
        let isIdentify = await this.doIdentity3Element(mobile, cardId, realName);
        if (isIdentify) {
            // save to identity respository
            await this.identityRepository.save({
                mobile,
                cardId,
                realName,
                user: { userId: userId }
            })
        } else {
            throw new ApiException("实名认证失败", 403)
        }
    }

    /* 通过手机号三要素获取实名认证 */
    async doIdentity3Element(
        mobile: string, cardId: string, realName: string
    ): Promise<boolean> {
        // 云市场分配的密钥Id
        let secretId = "AKID3t7Cp71mh2cwXVijzY68kOt049JNHIuW7OPE";
        // 云市场分配的密钥Key
        let secretKey = "4z6l4bMntHCrlexiundk5OuI1nvnjL32itSqus38";
        let source = "market-7i7dha900";

        let body = {
            "idCard": cardId,
            "mobile": mobile,
            "realName": realName,
        }
        let datetime = (new Date()).toUTCString();
        let signStr = "x-date: " + datetime + "\n" + "x-source: " + source;
        var sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(signStr, secretKey))
        var auth = 'hmac id="' + secretId + '", algorithm="hmac-sha1", headers="x-date x-source", signature="' + sign + '"';
        let options = {
            headers: {
                "X-Source": source,
                "X-Date": datetime,
                "Authorization": auth,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }

        this.logger.debug(JSON.stringify(body));

        let res = await this.httpService.axiosRef.post<any>(this.remoteUrl, querystring.stringify(body), options);
        // res: AxiosResponse<any>;
        // this.logger.debug(res.data);
        if (res.data.error_code == 0) {
            let result = res.data.result;
            if (result.VerificationResult == 1) {
                //  success for identity.
                return true;
            }
        }
        return false;
    }

    async identityWithCrichain(address: string, cardId: string, realName: string, userId: number) {
        // let isIdentify = true;
        let isIdentify = await this.doIdentityWithCrichain(address, cardId, realName)
        if (isIdentify) {
            // save to identity respository
            await this.identityRepository.save({
                mobile: address.slice(0, 10),
                cardId,
                realName,
                user: { userId: userId }
            })
        } else {
            throw new ApiException("实名认证失败", 403)
        }
    }
    /* 通过手机号三要素获取实名认证 */
    async doIdentityWithCrichain(
        address: string, cardId: string, realName: string
    ): Promise<boolean> {

        const pattern = { cmd: 'realAuth' }
        const dto = new RealAuthDto()
        dto.hexAddress = address
        dto.userCardId = cardId
        dto.userName = realName
        const response = await firstValueFrom(this.chainClient.send(pattern, dto))
        if (!response || !response.result)
            return false;
        return true
    }

    /* 分页查询 */
    async list(reqIdentityList: ReqIdentityList): Promise<PaginatedDto<Identity>> {
        let where: FindOptionsWhere<Identity> = {}
        let result: any;
        if (reqIdentityList.mobile) {
            where.mobile = Like(`%${reqIdentityList.mobile}%`)
        }
        if (reqIdentityList.realName) {
            where.realName = Like(`%${reqIdentityList.realName}%`)
        }
        if (reqIdentityList.cardId) {
            where.cardId = Like(`%${reqIdentityList.cardId}%`)
        }
        result = await this.identityRepository.findAndCount({
            // select: ['id', 'address', 'privateKey', 'createTime', 'status'],
            where,
            skip: reqIdentityList.skip,
            take: reqIdentityList.take
        })

        return {
            rows: result[0],
            total: result[1]
        }
    }
}

