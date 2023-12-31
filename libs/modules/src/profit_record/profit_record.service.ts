import { Injectable } from '@nestjs/common';
import { CreateProfitRecordDto, ListMyProfitRecordDto, ListProfitRecordDto, GetTotalProfitDto } from './dto/create-profit_record.dto';
import { UpdateProfitRecordDto } from './dto/update-profit_record.dto';
import { ProfitRecord, ProfitSubType, ProfitType } from './entities/profit_record.entity';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import moment from 'moment';
import { Between, FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProfitRecordService {
  constructor(
    @InjectRepository(ProfitRecord) private readonly profitRepository: Repository<ProfitRecord>,
  ) {}
  create(createProfitDto: CreateProfitRecordDto) {
    // 创建收益记录
    const profitRecord = {
      ...createProfitDto
    }
    return this.profitRepository.save(profitRecord)
  }

  /* 获取总值 */
  async total(getTotalList: GetTotalProfitDto): Promise<any> {
    let where: FindOptionsWhere<ProfitRecord> = {}
    let result: any;
    if(getTotalList.type === ProfitType.InnerTransferFee) {
      const { totalUsdtFee } = await this.profitRepository
      .createQueryBuilder("profitRecord")
      .select("SUM(profitRecord.fee)", "totalUsdtFee")
      .where("profitRecord.type = :type", { type:  getTotalList.type})
      .andWhere("profitRecord.subtype = :subtype", { subtype:  ProfitSubType.USDT})
      .getRawOne()

      const { totalHkdFee } = await this.profitRepository
      .createQueryBuilder("profitRecord")
      .select("SUM(profitRecord.fee)", "totalHkdFee")
      .where("profitRecord.type = :type", { type:  getTotalList.type})
      .andWhere("profitRecord.subtype = :subtype", { subtype:  ProfitSubType.HKD})
      .getRawOne()

      const { todayUsdtFee } = await this.profitRepository
      .createQueryBuilder("profitRecord")
      .select("SUM(profitRecord.fee)", "todayUsdtFee")
      .where("profitRecord.type = :type", { type:  getTotalList.type})
      .andWhere("profitRecord.subtype = :subtype", { subtype:  ProfitSubType.USDT})
      .andWhere("DATE(DATE_ADD(profitRecord.createTime,INTERVAL 8 HOUR)) = CURDATE()")
      .getRawOne()

      const { todayHkdFee } = await this.profitRepository
      .createQueryBuilder("profitRecord")
      .select("SUM(profitRecord.fee)", "todayHkdFee")
      .where("profitRecord.type = :type", { type:  getTotalList.type})
      .andWhere("profitRecord.subtype = :subtype", { subtype:  ProfitSubType.HKD})
      .andWhere("DATE(DATE_ADD(profitRecord.createTime,INTERVAL 8 HOUR)) = CURDATE()")
      .getRawOne()
      return {
        totalUsdtFee: totalUsdtFee,
        totalHkdFee: totalHkdFee,
        todayUsdtFee: todayUsdtFee,
        todayHkdFee: todayHkdFee
      }
    }
    const { totalFee } = await this.profitRepository
    .createQueryBuilder("profitRecord")
    .select("SUM(profitRecord.fee)", "totalFee")
    .where("profitRecord.type = :type", { type:  getTotalList.type})
    .getRawOne()

    const { todayFee } = await this.profitRepository
    .createQueryBuilder("profitRecord")
    .select("SUM(profitRecord.fee)", "todayFee")
    .where("profitRecord.type = :type", { type:  getTotalList.type})
    .andWhere("DATE(DATE_ADD(profitRecord.createTime,INTERVAL 8 HOUR)) = CURDATE()")
    .getRawOne()

    return {
      totalFee: totalFee,
      todayFee: todayFee
    }
  }

  /* 分页查询 */
  async list(listOrderList: ListProfitRecordDto, paginationDto: PaginationDto): Promise<PaginatedDto<ProfitRecord>> {
    let where: FindOptionsWhere<ProfitRecord> = {}
    let result: any;
    where = listOrderList

    if(paginationDto.beginTime)
      where.createTime = Between(paginationDto.beginTime, paginationDto.endTime)
      
    result = await this.profitRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: { },
      skip: paginationDto.skip,
      take: paginationDto.take || 15,
      order: {
        createTime: 'DESC',
      }
    })

    const rows = result[0]
    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* 我的订单查询 */
  async mylist(userId: number, listMyOrderDto: ListMyProfitRecordDto, paginationDto: PaginationDto): Promise<PaginatedDto<ProfitRecord>> {
    let where: FindOptionsWhere<ListProfitRecordDto> = {}
    let result: any;
    where = {
      ...listMyOrderDto,
      userId,
    }

    result = await this.profitRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: {},
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
    return `This action returns a #${id} profitRecord`;
  }

  update(id: number, updateProfitRecordDto: UpdateProfitRecordDto) {
    return `This action updates a #${id} profitRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} profitRecord`;
  }
}
