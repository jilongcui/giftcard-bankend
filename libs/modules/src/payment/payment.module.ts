import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BankcardModule } from '../bankcard/bankcard.module';
import { OrderModule } from '../order/order.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ChainModule } from '@app/chain';
import { Account } from '../account/entities/account.entity';
import { Activity } from '../activity/entities/activity.entity';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { Order } from '../order/entities/order.entity';
import { Magicbox } from '../magicbox/entities/magicbox.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Payment, Order, Activity, Account, Asset, Collection, AssetRecord, Magicbox]),
    ClientsModule.register([
      { name: 'CHAIN_SERVICE', transport: Transport.TCP, options: { port: 4000 } },
    ]),
    ChainModule,
    BankcardModule,
    forwardRef(() => OrderModule)
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule { }
