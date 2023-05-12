import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Currency } from '../currency/entities/currency.entity';
import { UserModule } from '../system/user/user.module';
import { Exchange } from '../exchange/entities/exchange.entity';
import { Transfer } from '../transfer/entities/transfer.entity';
import { ProfitRecordModule } from '../profit_record/profit_record.module';
import { InviteUser } from '../inviteuser/entities/invite-user.entity';
import { SysConfigModule } from '../system/sys-config/sys-config.module';
import { BrokerageRecordModule } from '../brokerage_record/brokerage_record.module';
import { AccountFlow } from './entities/account-flow.entity';
import { AccountFlowController } from './account-flow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Account, AccountFlow, Currency, Exchange, Transfer, InviteUser]),
    UserModule, ProfitRecordModule, BrokerageRecordModule, SysConfigModule],
  controllers: [AccountController, AccountFlowController],
  providers: [AccountService, AccountService]
})
export class AccountModule { }
