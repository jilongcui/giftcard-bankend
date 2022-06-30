import { Injectable, OnModuleInit } from '@nestjs/common';
import { ResAddressDto } from './dto/res-address.dto';
import { ReqAddressDto } from './dto/req-address.dto';
import * as jaysonPromise from 'jayson/promise';
import { ReqAddressList } from './dto/req-address-list.dto';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { Address } from './entities/Address.entity';
import { FindConditions, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AddressService implements OnModuleInit {
    private rpcClient: any;
    private response: ResAddressDto;

    constructor(@InjectRepository(Address) private readonly addressRepository: Repository<Address>) { }

    onModuleInit() {
        console.log("onModuleInit");
        // this.addressRpcService = this.clientRpc.getService<AddressRpcService>('AddressRpcService');
        // create a client
        this.rpcClient = jaysonPromise.client.http({
            host: 'localhost',
            port: 2000
        });
    }

    async addressCreate(data: ReqAddressDto): Promise<ResAddressDto> {
        // return this.addressRpcService.addressCreate(data)
        this.response = await this.rpcClient.request('addressCreate', data);
        return this.response;
    }

    /* 分页查询 */
    async list(reqAddressList: ReqAddressList): Promise<PaginatedDto<Address>> {
        let where: FindConditions<Address> = {}
        if (reqAddressList.address) {
            where.address = Like(`%${reqAddressList.address}%`)
        }
        if (reqAddressList.userId) {
            where.userId = reqAddressList.userId
        }
        if (reqAddressList.addressType) {
            where.addressType = reqAddressList.addressType
        }
        const result = await this.addressRepository.findAndCount({
            select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
            where,
            skip: reqAddressList.skip,
            take: reqAddressList.take
        })
        return {
            rows: result[0],
            total: result[1]
        }
    }
}
