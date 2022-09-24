import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from '../activity/entities/activity.entity';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { Magicbox } from './entities/magicbox.entity';
import { MagicboxService } from './magicbox.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Asset, Magicbox, Activity, AssetRecord])],
  providers: [MagicboxService],
  exports: [MagicboxService]
})
export class MagicboxModule { }
