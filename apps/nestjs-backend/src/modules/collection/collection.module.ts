import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { Asset } from './entities/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Asset])],
  controllers: [CollectionController, AssetController],
  providers: [CollectionService, AssetService]
})
export class CollectionModule { }
