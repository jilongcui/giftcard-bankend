import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Collection } from '../collection/entities/collection.entity';
import { CreateAssetRecordDto, UpdateAssetRecordDto } from './dto/request-asset-record.dto';
import { AssetRecord } from './entities/asset-record.entity';

@Injectable()
export class AssetRecordService {
  constructor(
    @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
  ) { }
  create(createAssetRecordDto: CreateAssetRecordDto) {
    return 'This action adds a new market';
  }

  async list(id: number, paginationDto: PaginationDto): Promise<PaginatedDto<AssetRecord>> {
    let where: FindOptionsWhere<AssetRecord> = {}
    let result: any;
    where = { assetId: id };
    result = await this.assetRecordRepository.findAndCount({
      select: {
        id: true,
        type: true,
        price: true,
        fromName: true,
        toName: true,
        createTime: true
      },
      where,
      // relations: ['collections', 'collections.author'],
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        id: 'DESC'
      }
    })
    return {
      rows: result[0],
      total: result[1]
    }
  }

  remove(id: number) {
    return `This action removes a #${id} market`;
  }
}
