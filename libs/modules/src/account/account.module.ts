import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Currency } from '../currency/entities/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Currency])],
  controllers: [AccountController],
  providers: [AccountService]
})
export class AccountModule { }
