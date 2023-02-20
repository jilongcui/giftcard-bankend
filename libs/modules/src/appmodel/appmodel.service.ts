import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateAppmodelDto, ListAppmodelDto, UpdateAppmodelDto } from './dto/request-appmodel.dto';
import { Appmodel } from './entities/appmodel.entity';

@Injectable()
export class AppmodelService {
  constructor(
    @InjectRepository(Appmodel) private readonly appmodelRepository: Repository<Appmodel>,
  ) { }

  create(createAppmodelDto: CreateAppmodelDto) {
    return this.appmodelRepository.save(createAppmodelDto)
  }

  /* 分页查询 */
  async list(listAppmodelDto: ListAppmodelDto, paginationDto: PaginationDto): Promise<PaginatedDto<Appmodel>> {
    let where: FindOptionsWhere<Appmodel> = {}
    let result: any;
    where = listAppmodelDto;
    result = await this.appmodelRepository.findAndCount({
      where,
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        index: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.appmodelRepository.findOneBy({ id })
  }

  update(id: number, updateAppmodelDto: UpdateAppmodelDto) {
    return this.appmodelRepository.update(id, updateAppmodelDto)
  }

  remove(id: number) {
    return this.appmodelRepository.delete(id)
  }
}

