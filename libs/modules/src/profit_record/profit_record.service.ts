import { Injectable } from '@nestjs/common';
import { CreateProfitRecordDto, ListMyProfitRecordDto, ListProfitRecordDto, GetTotalProfitDto } from './dto/create-profit_record.dto';
import { UpdateProfitRecordDto } from './dto/update-profit_record.dto';
import { ProfitRecord, ProfitType } from './entities/profit_record.entity';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import moment from 'moment';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { ListMyOrderDto, ListOrderDto } from '../order/dto/request-order.dto';
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

    const { totalFee } = await this.profitRepository
    .createQueryBuilder("profitRecord")
    .select("SUM(profitRecord.fee)", "totalFee")
    .where("profitRecord.type = :type", { id:  getTotalList.type})
    .getRawOne()

    const { todayFee } = await this.profitRepository
    .createQueryBuilder("profitRecord")
    .select("SUM(profitRecord.fee)", "todayFee")
    .where("profitRecord.type = :type", { type:  getTotalList.type})
    .andWhere("DATE(profitRecord.createTime) = CURDATE()")
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
