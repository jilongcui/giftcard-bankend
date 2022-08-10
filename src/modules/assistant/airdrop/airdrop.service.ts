import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindConditions, Repository } from 'typeorm';
import { CreateAirdropDto, ListAirdropDto, UpdateAirdropDto } from './dto/request-airdrop.dto';
import { Airdrop } from './entities/airdrop.entity';

@Injectable()
export class AirdropService {
  constructor(
    @InjectRepository(Airdrop) private readonly airdropRepository: Repository<Airdrop>
  ) { }
  async create(createAirdropDto: CreateAirdropDto) {
    return await this.airdropRepository.save(createAirdropDto)
  }

  /* 分页查询 */
  async list(listAirdropList: ListAirdropDto, paginationDto: PaginationDto): Promise<PaginatedDto<Airdrop>> {
    let where: FindConditions<Airdrop> = {}
    let result: any;
    where = listAirdropList;

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

  async update(id: number, updateAirdropDto: UpdateAirdropDto) {
    return await this.airdropRepository.update(id, updateAirdropDto)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.airdropRepository.delete(noticeIdArr)
  }

  async remove(id: number) {
    return await this.airdropRepository.delete(id)
  }
}
