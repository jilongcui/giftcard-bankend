import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository, FindOptionsWhere, MoreThanOrEqual } from 'typeorm';
import { CreateKycDto, CreateKycInfoDto, ListKycDto, ListMyKycDto } from './dto/create-kyc.dto';
import { NotifyKycStatusDto, UpdateKycDto, UpdateKycStatusDto } from './dto/update-kyc.dto';
import { Kyc, KycCertifyInfo } from './entities/kyc.entity';
import { Fund33Service } from '../fund33/fund33.service';
import { SharedService } from '@app/shared';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KycService {
  logger = new Logger(KycService.name)
  notifyUrl: string
  constructor(
    @InjectRepository(Kyc) private readonly kycRepository: Repository<Kyc>,
    private readonly sharedService: SharedService,
    private readonly configService: ConfigService,
    private readonly fund33Service: Fund33Service,
  ) {
    this.notifyUrl = this.configService.get<string>('kyc.notifyUrl')
  }

  async create(createKycInfoDto: CreateKycInfoDto, userId: number) {
    const kyc = await this.findOneByUser(userId)
    if(kyc) {
      throw new ApiException("已存在KYC")
    }
    // createKycInfoDto.sourceOfFunds =JSON.stringify(createKycInfoDto.sourceOfFunds)
    // createKycInfoDto.industry =JSON.stringify(createKycInfoDto.industry)
    // createKycInfoDto.jobPosition =JSON.stringify(createKycInfoDto.jobPosition)
    // createKycInfoDto.intended =JSON.stringify(createKycInfoDto.intended)
    // createKycInfoDto.purposeOfUse =JSON.stringify(createKycInfoDto.purposeOfUse)
    const kycDto: CreateKycDto = {
      info: {...createKycInfoDto},
      cardType: createKycInfoDto.certType,
      orderNo: this.sharedService.generateOrderNo(8),
      userId: userId
    }
    
    // this.logger.debug(kycDto)
    kycDto.info.merOrderNo = kycDto.orderNo
    kycDto.info.notifyUrl = this.notifyUrl

    await this.fund33Service.uploadKycInfo(kycDto.info)
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
    this.logger.debug(`notify: ` + JSON.stringify(notifyKycDto))
    const kyc = await this.findOneByOrderNo(notifyKycDto.merOrderNo)
    if(notifyKycDto.status === '1') notifyKycDto.status = '0'
    if(notifyKycDto.status === '2') notifyKycDto.status = '1'
    if(notifyKycDto.status === '3') notifyKycDto.status = '2'
    kyc.status = notifyKycDto.status
    await this.kycRepository.save(kyc)
    return 'ok'
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
