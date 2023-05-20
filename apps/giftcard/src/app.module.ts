import { ExistingProvider, forwardRef, Module } from '@nestjs/common';
import { NotifyController } from './notify/notify.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'apps/nestjs-backend/src/config/configuration'
import { SharedModule } from '@app/shared/shared.module';
import { LogModule } from '@app/modules/monitor/log/log.module';
import { UserModule } from '@app/modules/system/user/user.module';
import { CommonModule } from '@app/modules/common/common.module';
import { DictModule } from '@app/modules/system/dict/dict.module';
import { AccountModule } from '@app/modules/account/account.module';
import { ContractModule } from '@app/modules/contract/contract.module';
import { CurrencyModule } from '@app/modules/currency/currency.module';
import { LoginModule } from '@app/modules/login/login.module';
import { JobModule } from '@app/modules/monitor/job/job.module';
import { OnlineModule } from '@app/modules/monitor/online/online.module';
import { ServerModule } from '@app/modules/monitor/server/server.module';
import { SmscodeModule } from 'apps/giftcard/src/smscode/smscode.module';
import { AuthModule } from '@app/modules/system/auth/auth.module';
import { BannerModule } from '@app/modules/system/banner/banner.module';
import { DeptModule } from '@app/modules/system/dept/dept.module';
import { MenuModule } from '@app/modules/system/menu/menu.module';
import { NoticeModule } from '@app/modules/system/notice/notice.module';
import { PostModule } from '@app/modules/system/post/post.module';
import { RoleModule } from '@app/modules/system/role/role.module';
import { SysConfigModule } from '@app/modules/system/sys-config/sys-config.module';
import { AddressModule } from '@app/modules/wallet/address/address.module';
import { MemberModule } from '@app/modules/member/member.module';
import { EmailModule } from '@app/modules/email/email.module';
import { PdfModule } from '@app/modules/pdf/pdf.module';
import { KycModule } from '@app/modules/kyc/kyc.module';
import { CardinfoModule } from '@app/modules/cardinfo/cardinfo.module';
import { Fund33Module } from '@app/modules/fund33/fund33.module';
import { CollectModule } from '@app/modules/wallet/collect/collect.module';
import { StatsModule } from '@app/modules/stats/stats.module';
import { SubmitterModule } from '@app/modules/submitter/submitter.module';
import { ApplyCardModule } from '@app/modules/apply-card/apply-card.module';
import { WithdrawModule } from '@app/modules/wallet/withdraw/withdraw.module';
import { ExchangeModule } from '@app/modules/exchange/exchange.module';
import { TransferModule } from '@app/modules/transfer/transfer.module';
import { HomeAddressModule } from '@app/modules/homeaddress/homeaddress.module';
import { OrderModule } from './order/order.module';
import { BankcardModule } from './bankcard/bankcard.module';
import { PaymentModule } from './payment/payment.module';
import { GiftcardModule } from './giftcard/giftcard.module';
import { ProfitRecordModule } from '@app/modules/profit_record/profit_record.module';
import { PromotionAgentModule } from '@app/modules/promotion_agent/promotion_agent.module';
import { BrokerageRecordModule } from '@app/modules/brokerage_record/brokerage_record.module';
import { VersionModule } from '@app/modules/version/version.module';

// /* 将 provider的类名作为别名，方便定时器调用 */
// const providers = [JobService, OrderService,]
// function createAliasProviders(): ExistingProvider[] {
//   const aliasProviders: ExistingProvider[] = [];
//   for (const p of providers) {
//     aliasProviders.push({
//       provide: p.name,
//       useExisting: p,
//     });
//   }
//   return aliasProviders;
// }
// const aliasProviders = createAliasProviders();

@Module({

  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),

    /* 公共模块 */
    SharedModule,
    /* 业务模块 */
    CommonModule,
    LoginModule,
    AuthModule,
    UserModule,
    DictModule,
    SysConfigModule,
    NoticeModule,
    PostModule,
    DeptModule,
    MenuModule,
    RoleModule,
    LogModule,
    OnlineModule,
    JobModule,
    ServerModule,
    MemberModule,
    SmscodeModule,
    AddressModule,
    OrderModule,
    AccountModule,
    CurrencyModule,
    BankcardModule,
    PaymentModule,
    CurrencyModule,
    AccountModule,
    BannerModule,
    CollectModule,
    WithdrawModule,
    StatsModule,
    SubmitterModule,
    EmailModule,
    PdfModule,
    KycModule,
    CardinfoModule,
    Fund33Module,
    ApplyCardModule,
    ExchangeModule,
    TransferModule,
    HomeAddressModule,
    GiftcardModule,
    ProfitRecordModule,
    BrokerageRecordModule,
    PromotionAgentModule,
    VersionModule,
  ],
  // controllers: [NotifyController],
  // providers: [...aliasProviders],
})
export class AppModule { }
