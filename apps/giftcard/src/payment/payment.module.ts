import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BankcardModule } from '../bankcard/bankcard.module';
import { OrderModule } from '../order/order.module';
import { Order } from '../order/entities/order.entity';
import { WeChatPayModule } from 'nest-wechatpay-node-v3';
import { readFileSync } from 'fs';
import { Account } from '@app/modules/account/entities/account.entity';
import { SysConfigModule } from '@app/modules/system/sys-config/sys-config.module';
import { Bankcard } from '../bankcard/entities/bankcard.entity';
import { Giftcard } from '../giftcard/entities/giftcard.entity';
import { ProfitRecordModule } from '@app/modules/profit_record/profit_record.module';
import { InviteUser } from '@app/modules/inviteuser/entities/invite-user.entity';
import { BrokerageRecordModule } from '@app/modules/brokerage_record/brokerage_record.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Payment, Order, Account, Bankcard, Giftcard, InviteUser]),
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
          appid: process.env.WEIXIN_GZHAPPID, // Web网页使用公众号
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
    BankcardModule,
    SysConfigModule,
    forwardRef(() => OrderModule)
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule { }
