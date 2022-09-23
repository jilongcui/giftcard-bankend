import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { Asset } from './entities/asset.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AssetRecord } from '../market/entities/asset-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Asset, AssetRecord]),
  ClientsModule.register([
    { name: 'CHAIN_SERVICE', transport: Transport.TCP, options: { port: 4000 } },
  ])],
  controllers: [CollectionController, AssetController],
  providers: [CollectionService, AssetService],
  exports: [CollectionService]
})
export class CollectionModule { }
