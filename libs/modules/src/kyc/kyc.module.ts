import { Module, forwardRef } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { Kyc } from './entities/kyc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund33Module } from '../fund33/fund33.module';
import { SharedModule } from '@app/shared';
import { Bankcard } from 'apps/giftcard/src/bankcard/entities/bankcard.entity';
import { User } from '../system/user/entities/user.entity';
import { Order } from 'apps/giftcard/src/order/entities/order.entity';
import { SysConfigModule } from '../system/sys-config/sys-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kyc,Bankcard, User, Order]),
    SharedModule, Fund33Module, SysConfigModule
  ],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService]
})
export class KycModule {}
