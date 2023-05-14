import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../account/entities/account.entity';
import { Currency } from '../currency/entities/currency.entity';
import { UserModule } from '../system/user/user.module';
import { Exchange } from './entities/exchange.entity';
import { ExcelModule } from '../common/excel/excel.module';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Currency, Exchange]), UserModule, ExcelModule],
  controllers: [ExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService]
})
export class ExchangeModule {}
