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
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Activity, Account, Asset, Collection, AssetRecord, PreemptionWhitelist]),
    ClientsModule.register([
      { name: 'HELLO_SERVICE', transport: Transport.TCP, options: { port: 4000 } },
    ]),
  ],

  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule { }
