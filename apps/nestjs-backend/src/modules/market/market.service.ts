import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { privateDecrypt } from 'crypto';
import { Redis } from 'ioredis';
import { USER_CID_KEY } from '@app/common/contants/redis.contant';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Repository } from 'typeorm';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetRecord } from './entities/asset-record.entity';

@Injectable()
export class MarketService {
  constructor(
    @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
  ) { }

  async upAsset(id: number, price: number, userId: number, userName: string) {
    await this.assetRepository.update({ id: id, userId: userId }, { price: price, status: '1' })
    await this.assetRecordRepository.save({
      type: '1', // Sell
      assetId: id,
      price: price,
      fromId: userId,
      fromName: userName,
      toId: undefined,
      toName: undefined
    })
  }

  async buyAsset(id: number, userId: number, userName: string) {
    const asset = await this.assetRepository.findOne({ where: { id }, relations: ['user'] })
    const fromId = asset.user.userId
    const fromName = asset.user.userName
    if (fromId === userId)
      throw new ApiException("不能购买自己的资产")

    await this.assetRepository.update({ id: id, status: '1' }, { userId: userId })
    await this.assetRecordRepository.save({
      type: '2', // Buy
      assetId: id,
      price: asset.price,
      fromId: fromId,
      fromName: fromName,
      toId: userId,
      toName: userName
    })
  }

  async downAsset(id: number, userId: number, userName: string) {
    const asset = await this.assetRepository.update({ id: id, userId: userId }, { status: '0' })
    if (!asset) {
      throw new ApiException("无法操作此资产")
    }
    await this.assetRecordRepository.save({
      type: '3', // down
      assetId: id,
      price: undefined,
      fromId: undefined,
      fromName: undefined,
      toId: userId,
      toName: userName
    })
  }

  async transferAsset(id: number, userId: number, userName: string) {
    const asset = await this.assetRepository.findOne({ where: { id: id, userId: userId }, relations: ['user'] })
    if (!asset) {
      throw new ApiException("无法操作此资产")
    }
    const fromId = asset.user.userId
    const fromName = asset.user.userName
    if (fromId === userId)
      throw new ApiException("不能转移给自己")

    await this.assetRepository.update(id, { userId: userId })
    await this.assetRecordRepository.save({
      type: '4', // 转增
      assetId: id,
      price: asset.price,
      fromId: fromId,
      fromName: fromName,
      toId: userId,
      toName: userName
    })
  }
}
