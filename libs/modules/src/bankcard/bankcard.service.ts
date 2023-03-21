import { Inject, Injectable, Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateBankcardDto, ListMyBankcardDto, ListBankcardDto, UpdateBankcardDto, UpdateBankcardStatusDto } from './dto/request-bankcard.dto';
import { Bankcard } from './entities/bankcard.entity';
import { ConfigService } from '@nestjs/config';
import { IdentityService } from '../identity/identity.service';
import { ApiException } from '@app/common/exceptions/api.exception';
import { SharedService } from '@app/shared/shared.service';

@Injectable()
export class BankcardService {
  logger = new Logger(BankcardService.name)
  platformAddress: string
  constructor(
    @InjectRepository(Bankcard) private readonly bankcardRepository: Repository<Bankcard>,
    private readonly identityService: IdentityService,
    private readonly configService: ConfigService,
    private readonly sharedService: SharedService,

  ) {
    this.platformAddress = this.configService.get<string>('crichain.platformAddress')
  }

  async create(createBankcardDto: CreateBankcardDto, userId: number) {
    const identity = await this.identityService.findOneByUser(userId)
    if (identity === null) {
      throw new ApiException('没有实名认证')
    }
    const bgColor = this.sharedService.getBankBgColor(createBankcardDto.bankType)
    createBankcardDto.cardNo = createBankcardDto.cardNo.replace(/\s*/g, "")
    const bankcard = {
      ...createBankcardDto,
      userId,
      bgColor: bgColor,
      identityId: identity.identityId,
    }
    return this.bankcardRepository.save(bankcard)
  }

  /* 新增或编辑 */
  async addOrUpdateAll(createBankcardDto: CreateBankcardDto) {
    return await this.bankcardRepository.save(createBankcardDto)
  }

  /* 分页查询 */
  async list(listBankcardList: ListBankcardDto, paginationDto: PaginationDto): Promise<PaginatedDto<Bankcard>> {
    let where: FindOptionsWhere<Bankcard> = {}
    let result: any;
    where = listBankcardList

    result = await this.bankcardRepository.findAndCount({
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
  async mylist(userId: number, listMyBankcardDto: ListMyBankcardDto, paginationDto: PaginationDto): Promise<PaginatedDto<Bankcard>> {
    let where: FindOptionsWhere<ListBankcardDto> = {}
    let result: any;
    where = {
      ...listMyBankcardDto,
      userId,
    }

    result = await this.bankcardRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { identity: true },
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

  findOne(id: number) {
    return this.bankcardRepository.findOne({ where: { id: id }, relations: { user: true, identity: true } })
  }

  async update(id: number, updateBankcardDto: UpdateBankcardDto) {
    return this.bankcardRepository.update(id, updateBankcardDto)
  }

  async updateWithTradeNo(tradeNo: string, tradeTime: string, updateBankcardDto: UpdateBankcardDto) {
    return this.bankcardRepository.update({ signTradeNo: tradeNo, signTradeTime: tradeTime }, updateBankcardDto)
  }

  deleteOne(id: number) {
    return this.bankcardRepository.delete(id)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.bankcardRepository.delete(noticeIdArr)
  }

  async invalidate(id: number) {
    let updateBankcardDto: UpdateBankcardDto = {
      status: '0'
    }
    return this.bankcardRepository.update(id, updateBankcardDto)
  }

  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }

}
