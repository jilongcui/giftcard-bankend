import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindConditions, Repository } from 'typeorm';
import { CreatePreemptionActivityDto, ListPreemptionActivityDto, UpdatePreemptionActivityDto } from './dto/request-preemption-activity.dto';
import { PreemptionActivity } from './entities/preemption-activity.entity';

@Injectable()
export class PreemptionActivityService {
  constructor(
    @InjectRepository(PreemptionActivity) private readonly preemptionRepository: Repository<PreemptionActivity>
  ) { }
  async create(createPreemptionActivityDto: CreatePreemptionActivityDto) {
    return await this.preemptionRepository.save(createPreemptionActivityDto)
  }

  /* 分页查询 */
  async list(listPreemptionActivityList: ListPreemptionActivityDto, paginationDto: PaginationDto): Promise<PaginatedDto<PreemptionActivity>> {
    let where: FindConditions<PreemptionActivity> = {}
    let result: any;
    where = listPreemptionActivityList;

    result = await this.preemptionRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where: [where, {}],
      relations: ["collection"],
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
    return await this.preemptionRepository.findOne(id, { relations: ['collection'] });
  }

  async update(id: number, updatePreemptionActivityDto: UpdatePreemptionActivityDto) {
    return await this.preemptionRepository.update(id, updatePreemptionActivityDto)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.preemptionRepository.delete(noticeIdArr)
  }

  async remove(id: number) {
    return await this.preemptionRepository.delete(id)
  }
}
