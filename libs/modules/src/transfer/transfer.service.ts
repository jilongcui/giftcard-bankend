import { Injectable } from '@nestjs/common';
import { ListTransferDto } from './dto/create-transfer.dto';
import { Transfer } from './entities/transfer.entity';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from '@app/common/dto/pagination.dto';

@Injectable()
export class TransferService {

  constructor(
    @InjectRepository(Transfer) private readonly transferRepository: Repository<Transfer>,
  ) {}

  
  
  /* 分页查询 */
  async list(reqTransferList: ListTransferDto, paginationDto: PaginationDto): Promise<PaginatedDto<Transfer>> {
    let where: FindOptionsWhere<Transfer> = {}
    if (reqTransferList.fromUserId) {
      where.fromUserId = reqTransferList.userId
    }

    if (reqTransferList.toUserId) {
      where.toUserId = reqTransferList.toUserId
    }

    if (reqTransferList.status) {
        where.status = reqTransferList.status
    }
    const result = await this.transferRepository.findAndCount({
        select: {
          id: true,
          fromUserId: true,
          toUserId: true,
          currencyId: true,
          fromAmount: true,
          fee: true,
          toAmount: true,
          status: true,
          userId: true,
          createTime: true,
          updateTime: true,
          currency: {
            id: true,
            symbol: true,
          },
          fromUser: {
            userName: true,
            nickName: true,
            email: true,
            phonenumber: true,
            avatar: true
          },
          toUser: {
            userName: true,
            nickName: true,
            email: true,
            phonenumber: true,
            avatar: true
          }
        },
        relations: {fromUser: true, toUser: true, currency: true},
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

  /* 个人分页查询 */
  async mylist(userId: number, reqTransferList: ListTransferDto, paginationDto: PaginationDto): Promise<PaginatedDto<Transfer>> {
    let where1: FindOptionsWhere<Transfer> = {}
    where1.fromUserId = userId
    if (reqTransferList.status) {
      where1.status = reqTransferList.status
    }

    let where2: FindOptionsWhere<Transfer> = {}
    where2.toUserId = userId

    if (reqTransferList.status) {
        where2.status = reqTransferList.status
    }

    // where.userId = userId

    const result = await this.transferRepository.findAndCount({
        select: {
          id: true,
          fromUserId: true,
          toUserId: true,
          currencyId: true,
          fromAmount: true,
          fee: true,
          toAmount: true,
          status: true,
          userId: true,
          createTime: true,
          updateTime: true,
          currency: {
            id: true,
            symbol: true,
          },
          fromUser: {
            userName: true,
            nickName: true,
            email: true,
            phonenumber: true,
            avatar: true
          },
          toUser: {
            userName: true,
            nickName: true,
            email: true,
            phonenumber: true,
            avatar: true
          }
        },
        relations: {fromUser: true, toUser: true, currency: true},
        where: [where1, where2],
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
