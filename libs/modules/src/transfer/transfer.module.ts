import { Module } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferController } from './transfer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../account/entities/account.entity';
import { Currency } from '../currency/entities/currency.entity';
import { UserModule } from '../system/user/user.module';
import { Transfer } from './entities/transfer.entity';
import { ExcelModule } from '../common/excel/excel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Currency, Transfer]), UserModule,ExcelModule,
  ],
  controllers: [TransferController],
  providers: [TransferService],
  exports: [TransferService]
})
export class TransferModule {}
