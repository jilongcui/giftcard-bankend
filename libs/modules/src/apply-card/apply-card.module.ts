import { Module } from '@nestjs/common';
import { ApplyCardService } from './apply-card.service';
import { ApplyCardController } from './apply-card.controller';
import { CardinfoModule } from '../cardinfo/cardinfo.module';
import { KycModule } from '../kyc/kyc.module';
import { ApplyCard } from './entities/apply-card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyModule } from '../currency/currency.module';
import { Currency } from '../currency/entities/currency.entity';
import { Account } from '../account/entities/account.entity';
import { Bankcard } from 'apps/giftcard/src/bankcard/entities/bankcard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplyCard, Currency, Account, Bankcard]),
    CardinfoModule, KycModule, CurrencyModule
  ],
  controllers: [ApplyCardController],
  providers: [ApplyCardService]
})
export class ApplyCardModule {}
