import { CurrencyModule } from '@app/modules/currency/currency.module';
import { SysConfigModule } from '@app/modules/system/sys-config/sys-config.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressModule } from '../address/address.module';
import { CollectController } from './collect.controller';
import { CollectService } from './collect.service';
import { RechargeCollect } from './entities/rechage-collect.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RechargeCollect]),
    SysConfigModule, AddressModule, CurrencyModule
  ],
  controllers: [CollectController],
  providers: [CollectService]
})
export class CollectModule { }
