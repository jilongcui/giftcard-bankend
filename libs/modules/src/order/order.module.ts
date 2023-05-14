import { Module, forwardRef } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Account } from '../account/entities/account.entity';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { PreemptionWhitelist } from '../assistant/preemption/entities/preemptionWhitelist.entity';
import { PaymentModule } from '@app/modules/payment/payment.module';
import { User } from '../system/user/entities/user.entity';
import { Magicbox } from '../magicbox/entities/magicbox.entity';
import { MemberInfo } from '../member/entities/member-info.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Activity, Account, Asset, Collection, AssetRecord,
      PreemptionWhitelist, User, Magicbox, MemberInfo]),
    forwardRef(() => PaymentModule)
  ],

  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule { }
