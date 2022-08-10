import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindConditions, Repository } from 'typeorm';
import { CreatePreemptionDto, ListPreemptionDto, UpdatePreemptionDto } from './dto/request-preemption.dto';
import { Preemption } from './entities/preemption.entity';

@Injectable()
export class PreemptionService {
  constructor(
    @InjectRepository(Preemption) private readonly preemptionRepository: Repository<Preemption>
  ) { }
  async create(createPreemptionDto: CreatePreemptionDto) {
    return await this.preemptionRepository.save(createPreemptionDto)
  }

  /* 分页查询 */
  async list(listPreemptionList: ListPreemptionDto, paginationDto: PaginationDto): Promise<PaginatedDto<Preemption>> {
    let where: FindConditions<Preemption> = {}
    let result: any;
    where = listPreemptionList;

    result = await this.preemptionRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where: [where, {}],
      relations: ["activity"],
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

  async findOne(id: number) {
    return await this.preemptionRepository.findOne(id, { relations: ['activity'] });
  }

  async update(id: number, updatePreemptionDto: UpdatePreemptionDto) {
    return await this.preemptionRepository.update(id, updatePreemptionDto)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.preemptionRepository.delete(noticeIdArr)
  }

  async remove(id: number) {
    return await this.preemptionRepository.delete(id)
  }
}
