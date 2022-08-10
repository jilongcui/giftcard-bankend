import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindConditions, Repository } from 'typeorm';
import { CreateAirdropActivityDto, ListAirdropActivityDto, UpdateAirdropActivityDto } from './dto/request-airdrop-activity.dto';
import { AirdropActivity } from './entities/airdrop-activity.entity';

@Injectable()
export class AirdropActivityService {
  constructor(
    @InjectRepository(AirdropActivity) private readonly airdropRepository: Repository<AirdropActivity>
  ) { }
  async create(createAirdropActivityDto: CreateAirdropActivityDto) {
    return await this.airdropRepository.save(createAirdropActivityDto)
  }

  /* 分页查询 */
  async list(listAirdropActivityList: ListAirdropActivityDto, paginationDto: PaginationDto): Promise<PaginatedDto<AirdropActivity>> {
    let where: FindConditions<AirdropActivity> = {}
    let result: any;
    where = listAirdropActivityList;

    result = await this.airdropRepository.findAndCount({
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
    return await this.airdropRepository.findOne(id, { relations: ['collection'] });
  }

  async update(id: number, updateAirdropActivityDto: UpdateAirdropActivityDto) {
    return await this.airdropRepository.update(id, updateAirdropActivityDto)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.airdropRepository.delete(noticeIdArr)
  }

  async remove(id: number) {
    return await this.airdropRepository.delete(id)
  }
}
