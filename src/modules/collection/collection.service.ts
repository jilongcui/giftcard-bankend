import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindConditions, Like, Repository } from 'typeorm';
import { CreateCollectionDto, UpdateCollectionDto, ListCollectionDto } from './dto/request-collection.dto';
import { Collection } from './entities/collection.entity';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
  ) { }
  create(createCollectionDto: CreateCollectionDto) {
    return this.collectionRepository.save(createCollectionDto);
  }

  /* 新增或编辑 */
  async addOrUpdate(updateCollectionDto: UpdateCollectionDto) {
    return await this.collectionRepository.save(updateCollectionDto)
  }

  /* 分页查询 */
  async list(listProdList: ListCollectionDto, paginationDto: PaginationDto): Promise<PaginatedDto<Collection>> {
    let where: FindConditions<Collection> = {}
    let result: any;
    if (listProdList.name) {
      where.name = Like(`%${listProdList.name}%`)
    }
    if (listProdList.id) {
      where.id = listProdList.id
    }
    result = await this.collectionRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: ['contract', 'author'],
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 1,
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.collectionRepository.findOne(id, { relations: ['author', 'contract'], })
  }

  update(id: number, updateCollectionDto: UpdateCollectionDto) {
    return `This action updates a #${id} collection`;
  }

  remove(id: number) {
    return `This action removes a #${id} collection`;
  }
  async delete(noticeIdArr: number[] | string[]) {
    return this.collectionRepository.delete(noticeIdArr)
  }
}
