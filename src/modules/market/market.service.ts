import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { privateDecrypt } from 'crypto';
import { Redis } from 'ioredis';
import { USER_CID_KEY } from 'src/common/contants/redis.contant';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiException } from 'src/common/exceptions/api.exception';
import { FindConditions, Repository } from 'typeorm';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetRecord } from './entities/asset-record.entity';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
    @InjectRedis() private readonly redis: Redis,
  ) { }

  async upAsset(id: number, price: number, userId: number, userName: string) {
    await this.assetRepository.update(id, { status: '1' })
    await this.assetRecordRepository.save({
      assetId: id,
      price: price,
      fromId: userId,
      fromName: userName,
      toId: undefined,
      toName: undefined
    })
  }

  async downAsset(id: number, userId: number, userName: string) {
    await this.assetRepository.update(id, { status: '0' })
    await this.assetRecordRepository.save({
      assetId: id,
      price: undefined,
      fromId: undefined,
      fromName: undefined,
      toId: userId,
      toName: userName
    })
  }

  async buyAsset(id: number, userId: number, userName: string) {
    const asset = await this.assetRepository.findOne(id, { relations: ['user'] })
    const fromId = asset.user.userId
    const fromName = asset.user.userName
    if (fromId === userId)
      throw new ApiException("不能购买自己的资产")

    await this.assetRepository.update(id, { userId: userId })
    await this.assetRecordRepository.save({
      assetId: id,
      price: asset.value,
      fromId: fromId,
      fromName: fromName,
      toId: userId,
      toName: userName
    })
  }

  async assets(paginationDto: PaginationDto): Promise<PaginatedDto<Asset>> {
    let where: FindConditions<Asset> = {}
    let result: any;
    // where = { recommend: '1' };
    result = await this.assetRepository.findAndCount({
      // select: ['id', 'coverImage', 'startTime', 'status', 'endTime', 'title', 'type', 'collections',],
      where,
      relations: ['collections', 'collections.author'],
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        // type: 1,
      }
    })
    return {
      rows: result[0],
      total: result[1]
    }
  }

  async collections(paginationDto: PaginationDto): Promise<PaginatedDto<Collection>> {
    let where: FindConditions<Collection> = {}
    let result: any;
    // where = { recommend: '1' };
    result = await this.collectionRepository.findAndCount({
      // select: ['id', 'coverImage', 'startTime', 'status', 'endTime', 'title', 'type', 'collections',],
      where,
      relations: ['collections', 'collections.author'],
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        // type: 1,
      }
    })
    return {
      rows: result[0],
      total: result[1]
    }
  }
}
