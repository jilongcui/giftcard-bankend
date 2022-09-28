import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from '../activity/entities/activity.entity';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { MagicboxRecord } from './entities/magicbox-record.entity';
import { Magicbox } from './entities/magicbox.entity';
import { MagicboxRecordService } from './magicbox-record.service';
import { MagicboxService } from './magicbox.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Asset, Magicbox, Activity, AssetRecord, MagicboxRecord])],
  providers: [MagicboxService, MagicboxRecordService],
  exports: [MagicboxService, MagicboxRecordService]
})
export class MagicboxModule { }
