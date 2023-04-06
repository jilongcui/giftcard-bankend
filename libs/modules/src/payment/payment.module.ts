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
import { MagicboxRecord } from '../magicbox/entities/magicbox-record.entity';
import { SysConfigModule } from '../system/sys-config/sys-config.module';
import { CollectionModule } from '../collection/collection.module';
import { MemberModule } from '../member/member.module';
import { WeChatPayModule } from 'nest-wechatpay-node-v3';
import { readFileSync } from 'fs';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Payment, Order, Activity, Account, Asset, Collection, AssetRecord, Magicbox, MagicboxRecord]),
    ClientsModule.register([
      { name: 'CHAIN_SERVICE', transport: Transport.TCP, options: { port: 4000 } },
    ]),
    WeChatPayModule.registerAsync({
      name: 'XCXPayment',
      useFactory: async () => {
        return {
          appid: process.env.WEIXIN_APPID, // 小程序
          mchid: process.env.WEIXIN_MCHID,
          publicKey: readFileSync('./certs/apiclient_cert.pem'), // 公钥
          privateKey: readFileSync('./certs/apiclient_key.pem'), // 秘钥
          key: process.env.WEIXIN_API3KEY,
        };
      },
    }),
    WeChatPayModule.registerAsync({
      name: 'NTVPayment',
      useFactory: async () => {
        return {
          appid: process.env.WEIXIN_WEBAPPID, // Web网页
          mchid: process.env.WEIXIN_MCHID,
          publicKey: readFileSync('./certs/apiclient_cert.pem'), // 公钥
          privateKey: readFileSync('./certs/apiclient_key.pem'), // 秘钥
          key: process.env.WEIXIN_API3KEY,
        };
      },
    }),
    WeChatPayModule.registerAsync({
      name: 'GZHPayment',
      useFactory: async () => {
        return {
          appid: process.env.WEIXIN_GZHAPPID, // 公众号
          mchid: process.env.WEIXIN_MCHID,
          publicKey: readFileSync('./certs/apiclient_cert.pem'), // 公钥
          privateKey: readFileSync('./certs/apiclient_key.pem'), // 秘钥
          key: process.env.WEIXIN_API3KEY,
        };
      },
    }),
    ChainModule,
    BankcardModule,
    SysConfigModule,
    CollectionModule,
    MemberModule,
    forwardRef(() => OrderModule)
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule { }
