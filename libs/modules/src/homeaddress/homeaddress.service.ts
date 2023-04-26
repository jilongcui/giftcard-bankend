import { Injectable } from '@nestjs/common';
import { CreateHomeAddressDto, ListHomeAddressDto, ListMyHomeAddressDto } from './dto/create-homeaddress.dto';
import { UpdateHomeAddressDto } from './dto/update-homeaddress.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HomeAddress } from './entities/homeaddress.entity';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { ApiException } from '@app/common/exceptions/api.exception';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { User } from '../system/user/entities/user.entity';

@Injectable()
export class HomeAddressService {
  constructor(
    @InjectRepository(HomeAddress) private readonly homeAddressRepository: Repository<HomeAddress>,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}
  async create(createHomeaddressDto: CreateHomeAddressDto, userId: number) {
    // const address = await this.homeAddressRepository.findOneBy({userId, isDefault: true})
    // let isDefault = false
    // if(!address) {
    //   isDefault = true
    // }
    
    const addressDto: DeepPartial<HomeAddress> = {
      ...createHomeaddressDto,
      userId: userId
    }

    if(createHomeaddressDto.isDefault == true)
      await this.homeAddressRepository.update({userId}, {isDefault: false})
    const homeAddress = await this.homeAddressRepository.save(addressDto)
    return homeAddress
  }

  /* 分页查询 */
  async list(listHomeAddressList: ListHomeAddressDto, paginationDto: PaginationDto): Promise<PaginatedDto<HomeAddress>> {
    let where: FindOptionsWhere<ListHomeAddressDto> = {}
    let result: any;
    where = listHomeAddressList

    result = await this.homeAddressRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      // relations: { user: true },
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
  async mylist(userId: number, listMyHomeAddressDto: ListMyHomeAddressDto, paginationDto: PaginationDto): Promise<PaginatedDto<HomeAddress>> {
    let where: FindOptionsWhere<ListHomeAddressDto> = {}
    let result: any;
    where = {
      ...listMyHomeAddressDto,
      userId,
    }

    result = await this.homeAddressRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      // relations: ["user"],
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

  async setDefault(id: number, isDefault: boolean) {
    const address = await this.homeAddressRepository.findOneBy({id: id})
    if (!address)
      throw new ApiException("未找到此地址")
    await this.homeAddressRepository.update({userId: address.userId}, {isDefault: false})
    return await this.homeAddressRepository.update(id, {isDefault})
  }

  update(id: number, updateHomeaddressDto: UpdateHomeAddressDto, userId: number) {
    const address = this.homeAddressRepository.findOneBy({id: id, userId: userId})
    if (!address)
      throw new ApiException("非此用户的地址")
    this.homeAddressRepository.update({userId}, {isDefault: false})
    return this.homeAddressRepository.update(id, updateHomeaddressDto)
  }

  async findOne(id: number) {
    return this.homeAddressRepository.findOneBy({ id })
  }

  remove(id: number) {
    return this.homeAddressRepository.softDelete(id)
  }
}
