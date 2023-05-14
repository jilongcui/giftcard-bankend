import { CacheModule, Module, forwardRef } from '@nestjs/common';
import { BankcardService } from './bankcard.service';
import { BankcardController } from './bankcard.controller';
import { Bankcard } from './entities/bankcard.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import { Kyc } from '../kyc/entities/kyc.entity';
import { Cardinfo } from '../cardinfo/entities/cardinfo.entity';
import { User } from '../system/user/entities/user.entity';
import { CardinfoModule } from '../cardinfo/cardinfo.module';
import { MulterModule } from '@nestjs/platform-express';
import { storage } from '../common/upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bankcard, Kyc, Cardinfo, User]),
  CacheModule.register({
    ttl: 30, // seconds
  }),
  MulterModule.register({
    storage: storage,
    preservePath: false,
  }),
  IdentityModule, CardinfoModule],
  controllers: [BankcardController],
  providers: [BankcardService],
  exports: [BankcardService]
})
export class BankcardModule { }
