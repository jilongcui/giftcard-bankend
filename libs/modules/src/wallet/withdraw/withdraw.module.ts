import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { Account } from '@app/modules/account/entities/account.entity';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawFlow } from './entities/withdraw-flow.entity';
import { Withdraw } from './entities/withdraw.entity';
import { AddressModule } from '../address/address.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Withdraw, Account, WithdrawFlow]),
    AddressModule,
  ],
  controllers: [WithdrawController],
  providers: [WithdrawService]
})
export class WithdrawModule {}
