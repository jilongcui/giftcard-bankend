import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetRecord } from './entities/asset-record.entity';
import { AssetRecordService } from './asset-record.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Asset, AssetRecord])],
  controllers: [MarketController],
  providers: [MarketService, AssetRecordService]
})
export class MarketModule { }
