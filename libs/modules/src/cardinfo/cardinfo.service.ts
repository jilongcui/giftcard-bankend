import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateCardinfoDto, ListCardinfoDto } from './dto/create-cardinfo.dto';
import { UpdateCardinfoDto } from './dto/update-cardinfo.dto';
import { Cardinfo } from './entities/cardinfo.entity';

@Injectable()
export class CardinfoService {

  constructor(
    @InjectRepository(Cardinfo) private readonly cardinfoRepository: Repository<Cardinfo>
  ) {}

  create(createCardinfoDto: CreateCardinfoDto) {
    this.cardinfoRepository.save(createCardinfoDto)
  }

  /* 分页查询 */
  async list(listCardinfoList: ListCardinfoDto, paginationDto: PaginationDto): Promise<PaginatedDto<Cardinfo>> {
    let where: FindOptionsWhere<Cardinfo> = {}
    let result: any;
    where = listCardinfoList

    result = await this.cardinfoRepository.findAndCount({
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

  findOne(id: number) {
    return this.cardinfoRepository.findOne({ where: { id: id }, relations: { } })
  }

  update(id: number, updateCardinfoDto: UpdateCardinfoDto) {
    return this.cardinfoRepository.update(id, updateCardinfoDto)
  }

  remove(id: number) {
    return `This action removes a #${id} cardinfo`;
  }
}
