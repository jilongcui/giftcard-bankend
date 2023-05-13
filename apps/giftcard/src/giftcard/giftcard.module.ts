import { CacheModule, Module, forwardRef } from '@nestjs/common';
import { GiftcardService } from './giftcard.service';
import { GiftcardController } from './giftcard.controller';
import { Giftcard } from './entities/giftcard.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardinfoModule } from '@app/modules/cardinfo/cardinfo.module';
import { User } from '@app/modules/system/user/entities/user.entity';
import { Cardinfo } from '@app/modules/cardinfo/entities/cardinfo.entity';
import { Kyc } from '@app/modules/kyc/entities/kyc.entity';
import { ExcelModule } from '@app/modules/common/excel/excel.module';

@Module({
  imports: [TypeOrmModule.forFeature([Giftcard, Kyc, Cardinfo, User]),
  CacheModule.register({
    ttl: 30, // seconds
  }),
  CardinfoModule, ExcelModule],
  controllers: [GiftcardController],
  providers: [GiftcardService],
  exports: [GiftcardService]
})
export class GiftcardModule { }
