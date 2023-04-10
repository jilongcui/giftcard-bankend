import { Module } from '@nestjs/common';
import { ApplyCardService } from './apply-card.service';
import { ApplyCardController } from './apply-card.controller';
import { CardinfoModule } from '../cardinfo/cardinfo.module';
import { KycModule } from '../kyc/kyc.module';
import { ApplyCard } from './entities/apply-card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../system/user/user.module';
import { BankcardModule } from '../bankcard/bankcard.module';
import { CurrencyModule } from '../currency/currency.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplyCard]),
    CardinfoModule, KycModule, BankcardModule, AccountModule
  ],
  controllers: [ApplyCardController],
  providers: [ApplyCardService]
})
export class ApplyCardModule {}
