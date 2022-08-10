import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Activity, Account, Asset, Collection, AssetRecord, PreemptionWhitelist]),
  ],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule { }
