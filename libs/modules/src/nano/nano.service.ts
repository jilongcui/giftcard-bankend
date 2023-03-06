import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { CreateNanoDto, ListNanoDto, MyListNanoDto } from './dto/create-nano.dto';
import { UpdateNanoDto } from './dto/update-nano.dto';
import { Nano } from './entities/nano.entity';

@Injectable()
export class NanoService {

  constructor(
    @InjectRepository(Nano) private readonly nanoRepository: Repository<Nano>,
  ) {

  }
  create(createNanoDto: CreateNanoDto) {
    return 'This action adds a new nano';
  }

  findAll() {
    return `This action returns all nano`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nano`;
  }

  update(id: number, updateNanoDto: UpdateNanoDto) {
    return `This action updates a #${id} nano`;
  }

  remove(id: number) {
    return `This action removes a #${id} nano`;
  }

  /* 分页查询 */
  async list(listNanoList: ListNanoDto, paginationDto: PaginationDto): Promise<PaginatedDto<Nano>> {
    let where: FindOptionsWhere<Nano> = {}
    let result: any;
    where = {
      ...listNanoList,
      id: paginationDto.lastId?LessThan(paginationDto.lastId):undefined,
    }

    result = await this.nanoRepository.findAndCount({
      where,
      select: {
        id: true,
        content: true,
        type: true,
        dialogId: true,
        createTime: true,
        userId: true,
        user: {
          nickName: true,
          avatar: true,
        },
      },
      relations: { user: true },
      // skip: paginationDto.skip,
      take: paginationDto.take | 5,
      order: {
        id: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* 我的订单查询 */
  async mylist(listMyNanoDto: MyListNanoDto, userId: number, paginationDto: PaginationDto): Promise<PaginatedDto<Nano>> {
    let where: FindOptionsWhere<Nano> = {}
    let result: any;
    where = {
      ...listMyNanoDto,
      id: paginationDto.lastId?LessThan(paginationDto.lastId):undefined,
      userId,
    }

    result = await this.nanoRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      // relations: [],
      // skip: paginationDto.skip,
      take: paginationDto.take | 5,
      order: {
        id: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  async delete(nanoIdArr: number[] | string[]) {
    return this.nanoRepository.delete(nanoIdArr)
  }
}
