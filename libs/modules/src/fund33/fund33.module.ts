import { CacheModule, Module } from '@nestjs/common';
import { Fund33Service } from './fund33.service';
import { Fund33Controller } from './fund33.controller';
import { HttpModule } from '@nestjs/axios';
import { SharedModule } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bankcard } from '../bankcard/entities/bankcard.entity';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';
import { BankcardModule } from '../bankcard/bankcard.module';
import { Withdraw } from '../fund/entities/withdraw.entity';
import { Account } from '../account/entities/account.entity';
import { WithdrawFlow } from '../fund/entities/withdraw-flow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bankcard, Account,Withdraw, WithdrawFlow]),
    CacheModule.register({
      ttl: 60, // seconds
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    SharedModule, BankcardModule
  ],
  controllers: [Fund33Controller, WithdrawController],
  providers: [Fund33Service, WithdrawService],
  exports: [Fund33Service,WithdrawService]
})
export class Fund33Module {}
