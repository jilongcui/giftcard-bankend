import { CacheModule, Module } from '@nestjs/common';
import { Fund33Service } from './fund33.service';
import { Fund33Controller } from './fund33.controller';
import { HttpModule } from '@nestjs/axios';
import { SharedModule } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';
import { Withdraw } from './entities/withdraw.entity';
import { Account } from '../account/entities/account.entity';
import { WithdrawFlow } from './entities/withdraw-flow.entity';
import { BankcardModule } from 'apps/giftcard/src/bankcard/bankcard.module';
import { Bankcard } from 'apps/giftcard/src/bankcard/entities/bankcard.entity';
import { ProfitRecordModule } from '../profit_record/profit_record.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bankcard, Account,Withdraw, WithdrawFlow]),
    CacheModule.register({
      ttl: 30, // seconds
    }),
    
    SharedModule,
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ProfitRecordModule,
  ],
  controllers: [Fund33Controller, WithdrawController],
  providers: [Fund33Service, WithdrawService],
  exports: [Fund33Service,WithdrawService]
})
export class Fund33Module {}
