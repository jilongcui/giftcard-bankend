import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '@app/modules/account/entities/account.entity';
import { AssetRecord } from '@app/modules/market/entities/asset-record.entity';
import { User } from '@app/modules/system/user/entities/user.entity';
import { Order } from './entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Account, User, AssetRecord]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {}
