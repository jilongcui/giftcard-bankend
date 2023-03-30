import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ResAddressDto, ResRequestAddressDto } from './dto/res-address.dto';
import { ReqAddressAddDto, ReqAddressCreateDto, ReqAddressList, ReqAddressRequestDto, ReqMyAddressDto } from './dto/req-address.dto';
import * as jaysonPromise from 'jayson/promise';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { Address, AddressBEP, AddressBTC, AddressCRI, AddressETH, AddressTRC } from './entities/address.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Identity } from '@app/modules/identity/entities/identity.entity';
import { RealAuthDto } from '@app/chain/dto/request-chain.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AddressService implements OnModuleInit {
    private rpcClient: any;
    private response: ResAddressDto;
    secret: string
    baseUrl: string
    appKey: string
    appSecret: string
    
    constructor(
        @InjectRepository(AddressETH) private readonly addressEthRepository: Repository<AddressETH>,
        @InjectRepository(AddressBEP) private readonly addressBepRepository: Repository<AddressBEP>,
        @InjectRepository(AddressBTC) private readonly addressBtcRepository: Repository<AddressBTC>,
        @InjectRepository(AddressTRC) private readonly addressTrcRepository: Repository<AddressTRC>,
        @InjectRepository(AddressCRI) private readonly addressCriRepository: Repository<AddressCRI>,
        @InjectRepository(Identity) private readonly identityRepository: Repository<Identity>,
        @Inject('CHAIN_SERVICE') private client: ClientProxy,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { 
        this.secret = this.configService.get<string>('wallet.secret')
        this.baseUrl = this.configService.get<string>('wallet.baseUrl')
        this.appKey = this.configService.get<string>('wallet.appKey')
        this.appSecret = this.configService.get<string>('wallet.appSecret')
    }

    onModuleInit() {
        console.log("onModuleInit");
        // this.addressRpcService = this.clientRpc.getService<AddressRpcService>('AddressRpcService');
        // create a client
        this.rpcClient = jaysonPromise.client.http({
            host: 'localhost',
            port: 2000
        });
    }

    async addressCreate(data: ReqAddressCreateDto): Promise<ResAddressDto> {
        // Check if exist 
        let exist = false;
        if (data.addressType === 'CRI') {
            if (await this.addressCriRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === 'TRC') {
            if (await this.addressTrcRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === 'BEP'|| data.addressType === 'BSC') {
            if (await this.addressBepRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === 'BTC') {
            if (await this.addressBtcRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === 'ETH') {
            if (await this.addressEthRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }

        if (exist) {
            throw new ApiException('User address exist.')
        }
        let response: ResAddressDto;
        if (data.addressType === 'CRI') {
            // Get address from chain microservice
            const pattern = { cmd: 'createAddress' }
            response = await firstValueFrom(this.client.send<ResAddressDto>(pattern, {}))

        } else {
            response = await this.rpcClient.request('addressCreate', data);
        }
        const reqAddrAddDto = new ReqAddressAddDto()
        reqAddrAddDto.address = response.address
        reqAddrAddDto.privateKey = response.privatekeyEncode
        reqAddrAddDto.appId = 0
        reqAddrAddDto.userId = data.userId
        if (data.addressType === 'CRI')
            await this.addressCriRepository.save(reqAddrAddDto)
        else if (data.addressType === 'ETH')
            await this.addressEthRepository.save(reqAddrAddDto)
        else if (data.addressType === 'BEP' || data.addressType === 'BSC')
            await this.addressBepRepository.save(reqAddrAddDto)
        else if (data.addressType === 'TRC')
            await this.addressTrcRepository.save(reqAddrAddDto)
        else if (data.addressType === 'BTC')
            await this.addressBtcRepository.save(reqAddrAddDto)
        return response
    }

    async addressRequest(data: ReqAddressRequestDto, userId): Promise<ResRequestAddressDto[]> {
        // Check if exist 
        if (await this.addressCriRepository.findOneBy({ userId: data.userId, appId: data.appId }))
            throw new ApiException('User address exist.')

        const responses = await this.requestAddress(userId);
        for(let i=0; i< responses.length; i++) {
            const addressInfo = responses[i]
            const reqAddrAddDto = new ReqAddressAddDto()
            reqAddrAddDto.address = addressInfo.address
            reqAddrAddDto.privateKey = ''
            reqAddrAddDto.appId = 0
            reqAddrAddDto.userId = data.userId
            if (addressInfo.chain === 'CRI') {
                await this.addressCriRepository.save(reqAddrAddDto)
            }
            else if (addressInfo.chain === 'ETH') {
                await this.addressEthRepository.save(reqAddrAddDto)
            }
            else if (addressInfo.chain === 'BSC' || data.addressType === 'BEP') {
                await this.addressBepRepository.save(reqAddrAddDto)
            }
            else if (addressInfo.chain === 'TRC') {
                await this.addressTrcRepository.save(reqAddrAddDto)
            }
            else if (addressInfo.chain === 'BTC') {
                await this.addressBtcRepository.save(reqAddrAddDto)
            }
        }
        
        return responses
    }

    async requestAddress(userId: number): Promise<ResRequestAddressDto[]> {
        const requestUri = '/api/login'
        const body = {
            user: userId.toString()
        }
        let options = {
            headers: {
                "Content-Type": "application/json"
            },
            body: body
        }
        const remoteUrl = this.baseUrl + requestUri
        let res = await this.httpService.axiosRef.post<ResRequestAddressDto[]>(remoteUrl, options);
        const responseData = res.data
        return responseData
    }

    async findOne(userId: number) {
        let response = { cri: { address: '', status: '' }, bep: { address: '', status: '' }, eth: { address: '', status: '' }, trc: { address: '', status: '' }, btc: { address: '', status: '' } }
        let address: Address
        address = await this.addressCriRepository.findOne({ where: { userId: userId } })
        response.cri.address = address ? address.address : undefined
        response.cri.status = address ? address.status : undefined
        address = await this.addressBepRepository.findOne({ where: { userId: userId } })
        response.bep.address = address ? address.address : undefined
        response.bep.status = address ? address.status : undefined
        address = await this.addressEthRepository.findOne({ where: { userId: userId } })
        response.eth.address = address ? address.address : undefined
        response.eth.status = address ? address.status : undefined
        address = await this.addressTrcRepository.findOne({ where: { userId: userId } })
        response.trc.address = address ? address.address : undefined
        response.trc.status = address ? address.status : undefined
        address = await this.addressBtcRepository.findOne({ where: { userId: userId } })
        response.btc.address = address ? address.address : undefined
        response.btc.status = address ? address.status : undefined
        return response
    }

    async findAddress(addressValue: string, addressType: string) {
        // let response = { cri: { address: '', status: '' }, eth: { address: '', status: '' }, trc: { address: '', status: '' }, btc: { address: '', status: '' } }
        let address: Address
        if (addressType === 'CRI')
            address = await this.addressCriRepository.findOne({ where: { address: addressValue, addressType: addressType } })
        else if (addressType === 'ETH')
            address = await this.addressEthRepository.findOne({ where: { address: addressValue, addressType: addressType } })
        else if (addressType === 'BEP' || addressType === 'BSC')
            address = await this.addressBepRepository.findOne({ where: { address: addressValue, addressType: addressType } })
        else if (addressType === 'TRC')
            address = await this.addressTrcRepository.findOne({ where: { address: addressValue, addressType: addressType } })
        else if (addressType === 'BTC')
            address = await this.addressBtcRepository.findOne({ where: { address: addressValue, addressType: addressType } })
        return address
    }

    async bindWithCrichain(address: string, userId: number) {
        // let isIdentify = true;
        const addressInfo = await this.addressCriRepository.findOne({ where: { address: address } })
        if (!addressInfo) {
            throw new ApiException("没有找到此地址")
        }
        if (addressInfo.status !== '0') {
            throw new ApiException("此地址已绑定")
        }

        const identity = await this.identityRepository.findOne({ where: { user: { userId: userId } } })
        if (!identity) {
            throw new ApiException("没有实名认证")
        }
        let isBind = await this.doBindWithCrichain(address, identity.cardId, identity.realName)
        if (isBind) {
            // save address status to '1'
            await this.addressCriRepository.update({ userId: userId }, { status: '1' })
        } else {
            throw new ApiException("地址绑定失败", 403)
        }
    }
    async doBindWithCrichain(
        address: string, cardId: string, realName: string
    ): Promise<boolean> {

        const pattern = { cmd: 'realAuth' }
        const dto = new RealAuthDto()
        dto.hexAddress = address
        dto.userCardId = cardId
        dto.userName = realName
        const response = await firstValueFrom(this.client.send(pattern, dto))
        if (!response || !response.result)
            return false;
        return true
    }

    /* 分页查询 */
    async list(reqAddressList: ReqAddressList): Promise<PaginatedDto<Address>> {
        let where: FindOptionsWhere<Address> = {}
        let result: any;
        if (reqAddressList.address) {
            where.address = Like(`%${reqAddressList.address}%`)
        }
        if (reqAddressList.userId) {
            where.userId = reqAddressList.userId
        }
        if (reqAddressList.addressType === 'ETH') {
            result = await this.addressEthRepository.findAndCount({
                // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                where,
                skip: reqAddressList.skip,
                take: reqAddressList.take
            })
        } else if (reqAddressList.addressType === 'BEP' || reqAddressList.addressType === 'BSC') {
            result = await this.addressBepRepository.findAndCount({
                // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                where,
                skip: reqAddressList.skip,
                take: reqAddressList.take
            })
        } else if (reqAddressList.addressType === 'BTC') {
            result = await this.addressBtcRepository.findAndCount({
                // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                where,
                skip: reqAddressList.skip,
                take: reqAddressList.take
            })
        } else if (reqAddressList.addressType === 'TRC') {
            result = await this.addressTrcRepository.findAndCount({
                // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                where,
                skip: reqAddressList.skip,
                take: reqAddressList.take
            })
        } else {
            result = await this.addressEthRepository.findAndCount({
                // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                where,
                skip: reqAddressList.skip,
                take: reqAddressList.take
            })
            if (result[1] === 0) {
                result = await this.addressTrcRepository.findAndCount({
                    // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                    where,
                    skip: reqAddressList.skip,
                    take: reqAddressList.take
                })
            }
            if (result[1] === 0) {
                result = await this.addressBtcRepository.findAndCount({
                    // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                    where,
                    skip: reqAddressList.skip,
                    take: reqAddressList.take
                })
            }

        }

        return {
            rows: result[0],
            total: result[1]
        }
    }
}
