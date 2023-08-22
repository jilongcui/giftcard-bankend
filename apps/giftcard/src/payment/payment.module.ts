import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BankcardModule } from '../bankcard/bankcard.module';
import { OrderModule } from '../order/order.module';
import { Order } from '../order/entities/order.entity';
import { Account } from '@app/modules/account/entities/account.entity';
import { SysConfigModule } from '@app/modules/system/sys-config/sys-config.module';
import { Bankcard } from '../bankcard/entities/bankcard.entity';
import { Giftcard } from '../giftcard/entities/giftcard.entity';
import { InviteUser } from '@app/modules/inviteuser/entities/invite-user.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Payment, Order, Account, Bankcard, Giftcard, InviteUser]),
    BankcardModule,
    SysConfigModule,
    forwardRef(() => OrderModule)
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule { }
