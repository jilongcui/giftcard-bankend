import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetRecord } from './entities/asset-record.entity';
import { AssetRecordService } from './asset-record.service';
import { CollectionModule } from '../collection/collection.module';
import { AssetService } from '../collection/asset.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Asset, AssetRecord]),
    CollectionModule],
  controllers: [MarketController],
  providers: [MarketService, AssetRecordService, AssetService]
})
export class MarketModule { }
