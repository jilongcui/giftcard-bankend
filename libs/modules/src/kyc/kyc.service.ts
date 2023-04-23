import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { CreateKycDto, ListKycDto, ListMyKycDto } from './dto/create-kyc.dto';
import { NotifyKycStatusDto, UpdateKycDto, UpdateKycStatusDto } from './dto/update-kyc.dto';
import { Kyc, KycCertifyInfo } from './entities/kyc.entity';
import { Fund33Service } from '../fund33/fund33.service';
import { SharedService } from '@app/shared';

@Injectable()
export class KycService {
  logger = new Logger(KycService.name)
  constructor(
    @InjectRepository(Kyc) private readonly kycRepository: Repository<Kyc>,
    private readonly sharedService: SharedService,
    private readonly fund33Service: Fund33Service,
  ) {}

  async create(createKycDto: CreateKycDto, userId: number) {
    const kyc = await this.findOneByUser(userId)
    if(kyc) {
      throw new ApiException("已存在KYC")
    }
    const kycDto = {
      ...createKycDto,
      cardType: createKycDto.info.certType,
      orderNo: this.sharedService.generateOrderNo(8),
      userId: userId
    }
    // this.logger.debug(kycDto)
    createKycDto.info.merOrderNo = kycDto.orderNo

    await this.fund33Service.uploadKycInfo(createKycDto.info)
    return await this.kycRepository.save(kycDto)
  }

  async findOne(id: number) {
    return this.kycRepository.findOneBy({ id })
  }

  async findOneByUser(userId: number) {
    return this.kycRepository.findOneBy({userId})
  }

  async findOneByOrderNo(orderNo: string) {
    return this.kycRepository.findOneBy({orderNo})
  }

  async notify(notifyKycDto: NotifyKycStatusDto) {
    const kyc = await this.findOneByOrderNo(notifyKycDto.merOrderNo)
    kyc.status = notifyKycDto.status
    await this.kycRepository.save(kyc)
    return 
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
