import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirdropWhitelistService } from './airdropWhitelist.service';
import { AirdropWhitelistController } from './airdrop-whitelist.controller';
import { Airdrop } from './entities/airdrop-activity.entity';
import { AirdropWhitelist } from './entities/airdrop-whitelist.entity';
import { AirdropService } from './airdrop.service';
import { AirdropController } from './airdrop.controller';
import { CollectionModule } from '@app/modules/collection/collection.module';
import { UserModule } from '@app/modules/system/user/user.module';
import { MulterModule } from '@nestjs/platform-express';
import { storage } from '@app/modules/common/upload/upload.module';
import { Collection } from '@app/modules/collection/entities/collection.entity';
import { Asset } from '@app/modules/collection/entities/asset.entity';
import { AssetRecord } from '@app/modules/market/entities/asset-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AirdropWhitelist, Airdrop, Collection, Asset, AssetRecord]),
    CollectionModule, UserModule,
    MulterModule.register({
      storage: storage,
      preservePath: false,
    })
  ],
  controllers: [AirdropWhitelistController, AirdropController],
  providers: [AirdropWhitelistService, AirdropService],
  exports: [AirdropWhitelistService]
})
export class AirdropModule { }
