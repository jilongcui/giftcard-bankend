import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateAirdropWhitelistDto, ListAirdropWhitelistDto, UpdateAirdropWhitelistDto } from './dto/request-airdrop-whitelist.dto';
import { AirdropWhitelist } from './entities/airdrop-whitelist.entity';
import { ApiException } from '@app/common/exceptions/api.exception';
import { CollectionService } from '@app/modules/collection/collection.service';
import { UserService } from '@app/modules/system/user/user.service';

@Injectable()
export class AirdropWhitelistService {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly userService: UserService,
    @InjectRepository(AirdropWhitelist) private readonly airdropWhitelistRepository: Repository<AirdropWhitelist>
  ) { }
  async create(createAirdropWhitelistDto: CreateAirdropWhitelistDto) {
    return await this.airdropWhitelistRepository.save(createAirdropWhitelistDto)
  }

  /* 分页查询 */
  async list(listAirdropWhitelistList: ListAirdropWhitelistDto, paginationDto: PaginationDto): Promise<PaginatedDto<AirdropWhitelist>> {
    let where: FindOptionsWhere<AirdropWhitelist> = {}
    let result: any;
    where = listAirdropWhitelistList;

    result = await this.airdropWhitelistRepository.findAndCount({
      // select: {
      //   user: {
      //     userId: true,
      //     nickName: true,
      //   },
      //   collection: {
      //     name: true,
      //   }
      // },
      where: [where, {}],
      relations: { collection: true, user: true },
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
    return await this.airdropWhitelistRepository.findOne({ where: { id }, relations: { collection: true } });
  }

  async update(id: number, updateAirdropWhitelistDto: UpdateAirdropWhitelistDto) {
    return await this.airdropWhitelistRepository.update(id, updateAirdropWhitelistDto)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.airdropWhitelistRepository.delete(noticeIdArr)
  }

  async remove(id: number) {
    return await this.airdropWhitelistRepository.delete(id)
  }

  /* 导入空投白名单 */
  async insert(data: any) {
    let whitelistArr: AirdropWhitelist[] = []
    for await (const iterator of data) {
      let whitelist = new AirdropWhitelist()
      if (!iterator.collectionId || !iterator.userId) throw new ApiException('藏品ID和用户ID不能为空')
      const collection = await this.collectionService.findOne(iterator.collectionId)
      if (!collection) throw new ApiException('藏品不存在')
      const user = await this.userService.findById(iterator.userId)
      if (!user) throw new ApiException('用户不存在')
      whitelist = Object.assign(whitelist, iterator)
      whitelistArr.push(whitelist)
    }
    await this.airdropWhitelistRepository.createQueryBuilder()
      .insert()
      .into(AirdropWhitelist)
      .values(whitelistArr)
      .execute()
  }
}
