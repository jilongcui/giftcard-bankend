import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/modules/system/user/entities/user.entity';
import { Order } from './entities/order.entity';
import { Bankcard } from '../bankcard/entities/bankcard.entity';
import { PaymentModule } from '../payment/payment.module';
import { Giftcard } from '../giftcard/entities/giftcard.entity';
import { CurrencyModule } from '@app/modules/currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, User, Bankcard, Giftcard]),
    PaymentModule, CurrencyModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {}
