import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Account } from '../account/entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Activity, Account]),
  ],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule { }
