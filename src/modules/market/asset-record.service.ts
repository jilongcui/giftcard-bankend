import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindConditions, Repository } from 'typeorm';
import { Collection } from '../collection/entities/collection.entity';
import { CreateAssetRecordDto, UpdateAssetRecordDto } from './dto/request-asset-record.dto';
import { AssetRecord } from './entities/asset-record.entity';

@Injectable()
export class AssetRecordService {
  constructor(
    @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
    @InjectRedis() private readonly redis: Redis,
  ) { }
  create(createAssetRecordDto: CreateAssetRecordDto) {
    return 'This action adds a new market';
  }


  async list(id: number, paginationDto: PaginationDto): Promise<PaginatedDto<AssetRecord>> {
    let where: FindConditions<AssetRecord> = {}
    let result: any;
    // where = { recommend: '1' };
    result = await this.assetRecordRepository.findAndCount({
      // select: ['id', 'coverImage', 'startTime', 'status', 'endTime', 'title', 'type', 'collections',],
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
