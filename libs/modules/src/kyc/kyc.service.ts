import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { CreateKycDto, ListKycDto, ListMyKycDto } from './dto/create-kyc.dto';
import { UpdateKycDto, UpdateKycStatusDto } from './dto/update-kyc.dto';
import { Kyc } from './entities/kyc.entity';

@Injectable()
export class KycService {
  logger = new Logger(KycService.name)
  constructor(
    @InjectRepository(Kyc) private readonly kycRepository: Repository<Kyc>,
  ) {}

  create(createKycDto: CreateKycDto, userId: number) {
    const kycDto = {
      ...createKycDto,
      userId: userId
    }
    // this.logger.debug(kycDto)
    this.kycRepository.save(kycDto)
  }

  findOne(id: number) {
    return this.kycRepository.findOneBy({ id })
  }

  findOneByUser(id: number, userId: number) {
    return this.kycRepository.findOneBy({ id, userId})
  }

  update(id: number, updateKycDto: UpdateKycDto, userId: number) {
    const kyc = this.kycRepository.findOneBy({id: id, userId: userId})
    if (!kyc)
      throw new ApiException("非此用户的KYC")
    return this.kycRepository.update(id, updateKycDto)
  }

  updateStatus(id: number, updateKycDto: UpdateKycStatusDto, userId: number) {
    const kyc = this.kycRepository.findOneBy({id: id, userId: userId})
    if (!kyc)
      throw new ApiException("非此用户的KYC")
    return this.kycRepository.update(id, updateKycDto)
  }

  remove(id: number) {
    return this.kycRepository.softDelete(id)
  }

  /* 分页查询 */
  async list(listKycList: ListKycDto, paginationDto: PaginationDto): Promise<PaginatedDto<Kyc>> {
    let where: FindOptionsWhere<ListKycDto> = {}
    let result: any;
    where = listKycList

    result = await this.kycRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { user: true },
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
  async mylist(userId: number, listMyKycDto: ListMyKycDto, paginationDto: PaginationDto): Promise<PaginatedDto<Kyc>> {
    let where: FindOptionsWhere<ListKycDto> = {}
    let result: any;
    where = {
      ...listMyKycDto,
      userId,
    }

    result = await this.kycRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: ["user"],
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
}
