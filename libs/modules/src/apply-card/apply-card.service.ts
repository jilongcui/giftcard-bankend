import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CardinfoService } from '../cardinfo/cardinfo.service';
import { KycService } from '../kyc/kyc.service';
import { CreateApplyCardDto, ListMyApplyCardDto } from './dto/create-apply-card.dto';
import { ListApplyCardDto, UpdateApplyCardDto, UpdateApplyCardStatusDto } from './dto/update-apply-card.dto';
import { ApplyCard, ApplyCardStatus } from './entities/apply-card.entity';

@Injectable()
export class ApplyCardService {

  constructor(
    @InjectRepository(ApplyCard) private readonly applycardRepository: Repository<ApplyCard>,
    private readonly cardInfoService: CardinfoService,
    private readonly kycService: KycService,
  ) {}
  findAll() {
    return `This action returns all applyCard`;
  }

  findOne(id: number) {
    return this.applycardRepository.findOne({ where: { id: id }, relations: { user: true, kyc: true, bankcard: true } })
  }

  update(id: number, updateApplyCardDto: UpdateApplyCardDto) {
    return `This action updates a #${id} applyCard`;
  }

  remove(id: number) {
    return `This action removes a #${id} applyCard`;
  }

  /* 分页查询 */
  async list(listApplyCardList: ListApplyCardDto, paginationDto: PaginationDto): Promise<PaginatedDto<ApplyCard>> {
    let where: FindOptionsWhere<ApplyCard> = {}
    let result: any;
    where = listApplyCardList

    result = await this.applycardRepository.findAndCount({
      where,
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
  async mylist(userId: number, listMyApplyCardDto: ListMyApplyCardDto, paginationDto: PaginationDto): Promise<PaginatedDto<ApplyCard>> {
    let where: FindOptionsWhere<ListApplyCardDto> = {}
    let result: any;
    where = {
      ...listMyApplyCardDto,
      userId,
    }

    result = await this.applycardRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { kyc: true, bankcard: true },
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

  async create(createApplyCardDto: CreateApplyCardDto, userId: number) {
    // 读取卡片内容，是否存在
    const cardInfo = await this.cardInfoService.findOne(createApplyCardDto.cardinfoId)
    if (cardInfo === null) {
      throw new ApiException('银行卡类型错误')
    }

    // KYC是否存在
    const kyc = await this.kycService.findOne(createApplyCardDto.kycId)
    if (kyc === null) {
      throw new ApiException('KYC资料不存在')
    }
    const bankcard = {
      ...createApplyCardDto,
      userId,
    }
    return this.applycardRepository.save(bankcard)
  }

  deleteOne(id: number) {
    return this.applycardRepository.delete(id)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.applycardRepository.delete(noticeIdArr)
  }

  /* Kyc验证成功 */
  async kycCertified(id:number, userId: number) {
    let updateApplyCardDto: UpdateApplyCardDto = {
      status: ApplyCardStatus.KycCertified
    }
    return this.applycardRepository.update(id, updateApplyCardDto)
  }

  /* 申请成功 */
  async applySuccess(id:number, bankcardId:number, userId: number) {
    let updateApplyCardDto: UpdateApplyCardDto = {
      status: ApplyCardStatus.ApplySuccess,
      bankcardId: bankcardId
    }
    return this.applycardRepository.update(id, updateApplyCardDto)
  }

  /* KYC失败 */
  async kycCertifyFailed(id:number, userId: number) {
    let updateApplyCardDto: UpdateApplyCardDto = {
      status: ApplyCardStatus.KycFailed
    }
    return this.applycardRepository.update(id, updateApplyCardDto)
  }

  /* 申请失败 */
  async applyFailed(id:number, userId: number) {
    let updateApplyCardDto: UpdateApplyCardDto = {
      status: ApplyCardStatus.KycFailed
    }
    return this.applycardRepository.update(id, updateApplyCardDto)
  }
}
