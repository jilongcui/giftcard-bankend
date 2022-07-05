import { Injectable, OnModuleInit } from '@nestjs/common';
import { ResAddressDto } from './dto/res-address.dto';
import { ReqAddressCreateDto } from './dto/req-address.dto';
import * as jaysonPromise from 'jayson/promise';
import { ReqAddressList } from './dto/req-address-list.dto';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { Address, AddressBTC, AddressETH, AddressTRC } from './entities/address.entity';
import { FindConditions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AddressService implements OnModuleInit {
    private rpcClient: any;
    private response: ResAddressDto;

    constructor(
        @InjectRepository(AddressETH) private readonly addressEthRepository: Repository<AddressETH>,
        @InjectRepository(AddressBTC) private readonly addressBtcRepository: Repository<AddressETH>,
        @InjectRepository(AddressTRC) private readonly addressTrcRepository: Repository<AddressTRC>,
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
        // return this.addressRpcService.addressCreate(data)
        this.response = await this.rpcClient.request('addressCreate', data);
        return this.response;
    }

    /* 分页查询 */
    async list(reqAddressList: ReqAddressList): Promise<PaginatedDto<Address>> {
        let where: FindConditions<Address> = {}
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
