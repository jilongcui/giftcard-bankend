import { Module } from '@nestjs/common';
import { BankcardService } from './bankcard.service';
import { BankcardController } from './bankcard.controller';
import { Bankcard } from './entities/bankcard.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import { KycModule } from '../kyc/kyc.module';
import { Kyc } from '../kyc/entities/kyc.entity';
import { Cardinfo } from '../cardinfo/entities/cardinfo.entity';
import { User } from '../system/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bankcard, Kyc, Cardinfo, User]), IdentityModule, KycModule],
  controllers: [BankcardController],
  providers: [BankcardService],
  exports: [BankcardService]
})
export class BankcardModule { }
