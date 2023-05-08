import { Injectable } from '@nestjs/common';
import { ReqTransferListDto } from './dto/create-transfer.dto';
import { Transfer } from './entities/transfer.entity';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TransferService {

  constructor(
    @InjectRepository(Transfer) private readonly transferRepository: Repository<Transfer>,
  ) {}

  
  
  /* 分页查询 */
  async list(reqTransferList: ReqTransferListDto): Promise<PaginatedDto<Transfer>> {
    let where: FindOptionsWhere<Transfer> = {}
    if (reqTransferList.fromUserId) {
      where.fromUserId = reqTransferList.fromUserId
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
        skip: reqTransferList.skip,
        take: reqTransferList.take
    })
    return {
        rows: result[0],
        total: result[1]
    }
  }

  /* 个人分页查询 */
  async mylist(reqTransferList: ReqTransferListDto, userId: number): Promise<PaginatedDto<Transfer>> {
    let where: FindOptionsWhere<Transfer> = {}
    if (reqTransferList.fromUserId) {
      where.fromUserId = reqTransferList.fromUserId
    }

    if (reqTransferList.toUserId) {
      where.toUserId = reqTransferList.toUserId
    }

    if (reqTransferList.status) {
        where.status = reqTransferList.status
    }

    where.userId = userId

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
        skip: reqTransferList.skip,
        take: reqTransferList.take
    })
    return {
        rows: result[0],
        total: result[1]
    }
  }
}
