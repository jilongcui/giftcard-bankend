import { Injectable } from '@nestjs/common';
import { CreateBrokerageRecordDto, ListMyBrokerageRecordDto, ListBrokerageRecordDto, GetTotalBrokerageDto } from './dto/create-brokerage_record.dto';
import { BrokerageRecord } from './entities/brokerage_record.entity';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import moment from 'moment';
import { FindOptionsWhere, MoreThanOrEqual, Repository } from 'typeorm';
import { ListMyOrderDto, ListOrderDto } from '../order/dto/request-order.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BrokerageRecordService {
  constructor(
    @InjectRepository(BrokerageRecord) private readonly brokerageRepository: Repository<BrokerageRecord>,
  ) {}
  create(createProfitDto: CreateBrokerageRecordDto) {
    // 创建收益记录
    const profitRecord = {
      ...createProfitDto
    }
    return this.brokerageRepository.save(profitRecord)
  }

  /* 获取总值 */
  async total(getTotalList: GetTotalBrokerageDto): Promise<any> {
    let where: FindOptionsWhere<BrokerageRecord> = {}
    let result: any;

    const { totalFee } = await this.brokerageRepository
    .createQueryBuilder("profitRecord")
    .select("SUM(profitRecord.fee)", "totalFee")
    .where("profitRecord.type = :type", { id:  getTotalList.type})
    .getRawOne()

    const { todayFee } = await this.brokerageRepository
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
  async list(listOrderList: ListBrokerageRecordDto, paginationDto: PaginationDto): Promise<PaginatedDto<BrokerageRecord>> {
    let where: FindOptionsWhere<BrokerageRecord> = {}
    let result: any;
    where = listOrderList

    result = await this.brokerageRepository.findAndCount({
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
  async mylist(userId: number, listMyOrderDto: ListMyBrokerageRecordDto, paginationDto: PaginationDto): Promise<PaginatedDto<BrokerageRecord>> {
    let where: FindOptionsWhere<ListBrokerageRecordDto> = {}
    let result: any;
    where = {
      ...listMyOrderDto,
      userId,
    }

    result = await this.brokerageRepository.findAndCount({
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

  remove(id: number) {
    return `This action removes a #${id} profitRecord`;
  }
}
