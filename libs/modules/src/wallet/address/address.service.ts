import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ResAddressDto } from './dto/res-address.dto';
import { ReqAddressAddDto, ReqAddressCreateDto, ReqAddressList, ReqMyAddressDto } from './dto/req-address.dto';
import * as jaysonPromise from 'jayson/promise';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { Address, AddressBTC, AddressCRI, AddressETH, AddressTRC } from './entities/address.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { ApiException } from '@app/common/exceptions/api.exception';

@Injectable()
export class AddressService implements OnModuleInit {
    private rpcClient: any;
    private response: ResAddressDto;

    constructor(
        @InjectRepository(AddressETH) private readonly addressEthRepository: Repository<AddressETH>,
        @InjectRepository(AddressBTC) private readonly addressBtcRepository: Repository<AddressETH>,
        @InjectRepository(AddressTRC) private readonly addressTrcRepository: Repository<AddressTRC>,
        @InjectRepository(AddressCRI) private readonly addressCriRepository: Repository<AddressCRI>,
        @Inject('CHAIN_SERVICE') private client: ClientProxy,
    ) { }

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
        else if (data.addressType === 'BTC') {
            if (await this.addressBtcRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === 'ETH') {
            if (await this.addressCriRepository.findOneBy({ userId: data.userId, appId: data.appId }))
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
        else if (data.addressType === 'TRC')
            await this.addressTrcRepository.save(reqAddrAddDto)
        else if (data.addressType === 'BTC')
            await this.addressBtcRepository.save(reqAddrAddDto)
        return response
    }

    async findOne(userId: number) {
        let response = { cri: '', eth: '', trc: '', btc: '' }
        let address: Address
        address = await this.addressCriRepository.findOne({ where: { userId: userId } })
        response.cri = address ? address.address : undefined
        address = await this.addressEthRepository.findOne({ where: { userId: userId } })
        response.eth = address ? address.address : undefined
        address = await this.addressTrcRepository.findOne({ where: { userId: userId } })
        response.trc = address ? address.address : undefined
        address = await this.addressBtcRepository.findOne({ where: { userId: userId } })
        response.btc = address ? address.address : undefined
        return response
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
