import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreatePreemptionWhitelistDto, ListPreemptionWhitelistDto, UpdatePreemptionWhitelistDto } from './dto/request-preemption-whitelist.dto';
import { PreemptionWhitelist } from './entities/preemptionWhitelist.entity';

@Injectable()
export class PreemptionWhiteListService {
  constructor(
    @InjectRepository(PreemptionWhitelist) private readonly preemptionRepository: Repository<PreemptionWhitelist>
  ) { }
  async create(createPreemptionWhitelistDto: CreatePreemptionWhitelistDto) {
    return await this.preemptionRepository.save(createPreemptionWhitelistDto)
  }

  /* 分页查询 */
  async list(listPreemptionList: ListPreemptionWhitelistDto, paginationDto: PaginationDto): Promise<PaginatedDto<PreemptionWhitelist>> {
    let where: FindOptionsWhere<PreemptionWhitelist> = {}
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
    return await this.preemptionRepository.findOne({ where: { id }, relations: ['activity'] });
  }

  async update(id: number, updatePreemptionWhitelistDto: UpdatePreemptionWhitelistDto) {
    return await this.preemptionRepository.update(id, updatePreemptionWhitelistDto)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.preemptionRepository.delete(noticeIdArr)
  }

  async remove(id: number) {
    return await this.preemptionRepository.delete(id)
  }
}
