import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateAirdropWhitelistDto, ListAirdropWhitelistDto, UpdateAirdropWhitelistDto } from './dto/request-airdrop-whitelist.dto';
import { AirdropWhitelist } from './entities/airdrop-whitelist.entity';

@Injectable()
export class AirdropWhitelistService {
  constructor(
    @InjectRepository(AirdropWhitelist) private readonly airdropRepository: Repository<AirdropWhitelist>
  ) { }
  async create(createAirdropWhitelistDto: CreateAirdropWhitelistDto) {
    return await this.airdropRepository.save(createAirdropWhitelistDto)
  }

  /* 分页查询 */
  async list(listAirdropWhitelistList: ListAirdropWhitelistDto, paginationDto: PaginationDto): Promise<PaginatedDto<AirdropWhitelist>> {
    let where: FindOptionsWhere<AirdropWhitelist> = {}
    let result: any;
    where = listAirdropWhitelistList;

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
    return await this.airdropRepository.findOne({ where: { id }, relations: { collection: true } });
  }

  async update(id: number, updateAirdropWhitelistDto: UpdateAirdropWhitelistDto) {
    return await this.airdropRepository.update(id, updateAirdropWhitelistDto)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.airdropRepository.delete(noticeIdArr)
  }

  async remove(id: number) {
    return await this.airdropRepository.delete(id)
  }
}
