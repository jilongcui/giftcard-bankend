import { CacheModule, Module, forwardRef } from '@nestjs/common';
import { BankcardService } from './bankcard.service';
import { BankcardController } from './bankcard.controller';
import { Bankcard } from './entities/bankcard.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cardinfo } from '@app/modules/cardinfo/entities/cardinfo.entity';
import { Kyc } from '@app/modules/kyc/entities/kyc.entity';
import { CardinfoModule } from '@app/modules/cardinfo/cardinfo.module';
import { User } from '@app/modules/system/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bankcard, Kyc, Cardinfo, User]),
  CacheModule.register({
    ttl: 30, // seconds
  }),
  CardinfoModule],
  controllers: [BankcardController],
  providers: [BankcardService],
  exports: [BankcardService]
})
export class BankcardModule { }
