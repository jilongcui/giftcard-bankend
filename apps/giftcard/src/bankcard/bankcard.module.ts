import { CacheModule, Module, forwardRef } from '@nestjs/common';
import { BankcardService } from './bankcard.service';
import { BankcardController } from './bankcard.controller';
import { Bankcard } from './entities/bankcard.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cardinfo } from '@app/modules/cardinfo/entities/cardinfo.entity';
import { Kyc } from '@app/modules/kyc/entities/kyc.entity';
import { CardinfoModule } from '@app/modules/cardinfo/cardinfo.module';
import { User } from '@app/modules/system/user/entities/user.entity';
import { storage } from '@app/modules/common/upload/upload.module';
import { MulterModule } from '@nestjs/platform-express';
import { Fund33Module } from '@app/modules/fund33/fund33.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bankcard, Kyc, Cardinfo, User]),
  CacheModule.register({
    ttl: 30, // seconds
  }),
  MulterModule.register({
    storage: storage,
    preservePath: false,
  }),
  CardinfoModule, Fund33Module],
  controllers: [BankcardController],
  providers: [BankcardService],
  exports: [BankcardService]
})
export class BankcardModule { }
