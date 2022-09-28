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
import { User } from '../system/user/entities/user.entity';
import { MagicboxModule } from '../magicbox/magicbox.module';
import { MagicboxMarketService } from './magicbox-market.service';
import { MagicboxMarketController } from './magicbox-market.controller';
import { Magicbox } from '../magicbox/entities/magicbox.entity';
import { MagicboxRecord } from '../magicbox/entities/magicbox-record.entity';
import { MagicboxRecordService } from '../magicbox/magicbox-record.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Asset, AssetRecord, User, Magicbox, MagicboxRecord]),
    CollectionModule, MagicboxModule],
  controllers: [MarketController, MagicboxMarketController],
  providers: [MarketService, MagicboxMarketService, MagicboxRecordService, AssetRecordService, AssetService]
})
export class MarketModule { }
