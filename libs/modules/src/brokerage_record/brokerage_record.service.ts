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

    if(!getTotalList.type) {
      const { totalValue } = await this.brokerageRepository
      .createQueryBuilder("brokerageRecord")
      .select("SUM(brokerageRecord.value)", "totalValue")
      // .where("brokerageRecord.type = :type", { type:  getTotalList.type})
      .getRawOne()

      const { todayValue } = await this.brokerageRepository
      .createQueryBuilder("brokerageRecord")
      .select("SUM(brokerageRecord.value)", "todayValue")
      // .where("brokerageRecord.type = :type", { type:  getTotalList.type})
      .where("DATE(DATE_ADD(brokerageRecord.createTime,INTERVAL 8 HOUR)) = CURDATE()")
      .getRawOne()

      return {
        totalValue: totalValue,
        todayValue: todayValue
      }
    }
    const { totalValue } = await this.brokerageRepository
    .createQueryBuilder("brokerageRecord")
    .select("SUM(brokerageRecord.value)", "totalValue")
    .where("brokerageRecord.type = :type", { type:  getTotalList.type})
    .getRawOne()

    const { todayValue } = await this.brokerageRepository
    .createQueryBuilder("brokerageRecord")
    .select("SUM(brokerageRecord.value)", "todayValue")
    .where("brokerageRecord.type = :type", { type:  getTotalList.type})
    .andWhere("DATE(DATE_ADD(brokerageRecord.createTime,INTERVAL 8 HOUR)) = CURDATE()")
    .getRawOne()

    return {
      totalValue: totalValue,
      todayValue: todayValue
    }
  }

  /* 获取总值 */
  async mytotal(getTotalList: GetTotalBrokerageDto, userId: number): Promise<any> {
    let where: FindOptionsWhere<BrokerageRecord> = {}
    let result: any;

    if(!getTotalList.type) {
      const { totalValue } = await this.brokerageRepository
      .createQueryBuilder("brokerageRecord")
      .select("SUM(brokerageRecord.value)", "totalValue")
      // .where("brokerageRecord.type = :type", { type:  getTotalList.type})
      .where("brokerageRecord.userId = :userId", { userId:  userId})
      .getRawOne()
  
      const { todayValue } = await this.brokerageRepository
      .createQueryBuilder("brokerageRecord")
      .select("SUM(brokerageRecord.value)", "todayValue")
      // .where("brokerageRecord.type = :type", { type:  getTotalList.type})
      .where("brokerageRecord.userId = :userId", { userId:  userId})
      .andWhere("DATE(brokerageRecord.createTime) = CURDATE()")
      .getRawOne()
  
      return {
        totalValue: totalValue,
        todayValue: todayValue
      }
    } else {
      const { totalValue } = await this.brokerageRepository
      .createQueryBuilder("brokerageRecord")
      .select("SUM(brokerageRecord.value)", "totalValue")
      .where("brokerageRecord.type = :type", { type:  getTotalList.type})
      .andWhere("brokerageRecord.userId = :userId", { userId:  userId})
      .getRawOne()
  
      const { todayValue } = await this.brokerageRepository
      .createQueryBuilder("brokerageRecord")
      .select("SUM(brokerageRecord.value)", "todayValue")
      .where("brokerageRecord.type = :type", { type:  getTotalList.type})
      .andWhere("brokerageRecord.userId = :userId", { userId:  userId})
      .andWhere("DATE(brokerageRecord.createTime) = CURDATE()")
      .getRawOne()
  
      return {
        totalValue: totalValue,
        todayValue: todayValue
      }
    }
    
  }

  /* 分页查询 */
  async list(listBrokerageList: ListBrokerageRecordDto, paginationDto: PaginationDto): Promise<PaginatedDto<BrokerageRecord>> {
    let where: FindOptionsWhere<BrokerageRecord> = {}
    let result: any;
    where = listBrokerageList

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
  async mylist(userId: number, listMyBrokerageDto: ListMyBrokerageRecordDto, paginationDto: PaginationDto): Promise<PaginatedDto<BrokerageRecord>> {
    let where: FindOptionsWhere<ListBrokerageRecordDto> = {}
    let result: any;
    where = {
      ...listMyBrokerageDto,
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
