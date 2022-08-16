import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateAddressDto, ListAddressDto, UpdateAddressDto } from './dto/request-address.dto';
import { Address } from './entities/address.entity';

@Injectable()
export class AddressService {
    constructor(
        @InjectRepository(Address) private readonly addressRepository: Repository<Address>
    ) { }
    async create(createAddressDto: CreateAddressDto) {
        return await this.addressRepository.save(createAddressDto)
    }

    /* 分页查询 */
    async list(listAddressList: ListAddressDto, paginationDto: PaginationDto): Promise<PaginatedDto<Address>> {
        let where: FindOptionsWhere<Address> = {}
        let result: any;
        where = listAddressList;

        result = await this.addressRepository.findAndCount({
            // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
            where: [where, {}],
            relations: ["collection"],
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

    async findOne(id: number) {
        return await this.addressRepository.findOne({ where: { id }, relations: { user: true } });
    }

    async update(id: number, updateAddressDto: UpdateAddressDto) {
        return await this.addressRepository.update(id, updateAddressDto)
    }

    async delete(noticeIdArr: number[] | string[]) {
        return this.addressRepository.delete(noticeIdArr)
    }

    async remove(id: number) {
        return await this.addressRepository.delete(id)
    }
}