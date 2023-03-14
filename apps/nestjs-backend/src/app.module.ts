import { SysConfigModule } from '@app/modules/system/sys-config/sys-config.module';
import { CommonModule } from '@app/modules/common/common.module';
import { LoginModule } from '@app/modules/login/login.module';
import { SharedModule } from '@app/shared/shared.module';
import { ExistingProvider, Module } from '@nestjs/common';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@app/modules/system/auth/auth.module';
import { UserModule } from '@app/modules/system/user/user.module';
import { DictModule } from '@app/modules/system/dict/dict.module';
import { NoticeModule } from '@app/modules/system/notice/notice.module';
import { PostModule } from '@app/modules/system/post/post.module';
import { DeptModule } from '@app/modules/system/dept/dept.module';
import { MenuModule } from '@app/modules/system/menu/menu.module';
import { RoleModule } from '@app/modules/system/role/role.module';
import { LogModule } from '@app/modules/monitor/log/log.module';
import { OnlineModule } from '@app/modules/monitor/online/online.module';
import { JobModule } from '@app/modules/monitor/job/job.module';
import { ServerModule } from '@app/modules/monitor/server/server.module';
import { JobService } from '@app/modules/monitor/job/job.service';
import { AddressModule } from '@app/modules/wallet/address/address.module';
import { CollectModule } from '@app/modules/wallet/collect/collect.module';
import { IdentityModule } from '@app/modules/identity/identity.module';
import { SmscodeModule } from '@app/modules/smscode/smscode.module';
import { CollectionModule } from '@app/modules/collection/collection.module';
import { ActivityModule } from '@app/modules/activity/activity.module';
import { OrderModule } from '@app/modules/order/order.module';
import { ContractModule } from '@app/modules/contract/contract.module';
import { CurrencyModule } from '@app/modules/currency/currency.module';
import { AccountModule } from '@app/modules/account/account.module';
import { BannerModule } from '@app/modules/system/banner/banner.module';
import { MarketModule } from '@app/modules/market/market.module';
import { AirdropModule } from '@app/modules/assistant/airdrop/airdrop.module';
import { PreemptionModule } from '@app/modules/assistant/preemption/preemption.module';
import { OrderService } from '@app/modules/order/order.service';
import { BankcardModule } from '@app/modules/bankcard/bankcard.module';
import { PaymentModule } from '@app/modules/payment/payment.module';
import { FundModule } from '@app/modules/fund/fund.module';
import { LoginService } from '@app/modules/login/login.service';
import { StatsModule } from '@app/modules/stats/stats.module';
import { CollectionService } from '@app/modules/collection/collection.service';
import { AirdropWhitelistService } from '@app/modules/assistant/airdrop/airdropWhitelist.service';
import { MagicboxController } from './magicbox/magicbox.controller';
import { MagicboxModule } from '@app/modules/magicbox/magicbox.module';
import { MagicboxCollectionController } from './magicbox-collection/magicbox-collection.controller';
import { MagicboxService } from '@app/modules/magicbox/magicbox.service';
import { SubmitterController } from './submitter/submitter.controller';
import { SubmitterModule } from '@app/modules/submitter/submitter.module';
import { MemberModule } from '@app/modules/member/member.module';
import { DialogModule } from '@app/modules/dialog/dialog.module';
import { NanoModule } from '@app/modules/nano/nano.module';
import { AppmodelModule } from '@app/modules/appmodel/appmodel.module';
import { SecurityModule } from '@app/modules/security/security.module';

/* 将 provider的类名作为别名，方便定时器调用 */
const providers = [JobService, OrderService, LoginService, CollectionService, AirdropWhitelistService,
  MagicboxService]
function createAliasProviders(): ExistingProvider[] {
  const aliasProviders: ExistingProvider[] = [];
  for (const p of providers) {
    aliasProviders.push({
      provide: p.name,
      useExisting: p,
    });
  }
  return aliasProviders;
}
const aliasProviders = createAliasProviders();

@Module({
  imports: [
    /* 配置文件模块 */
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
    AddressModule,
    CollectModule,
    IdentityModule,
    MemberModule,
    SmscodeModule,
    CollectionModule,
    ActivityModule,
    OrderModule,
    ContractModule,
    CurrencyModule,
    AccountModule,
    BannerModule,
    MarketModule,
    AirdropModule,
    PreemptionModule,
    BankcardModule,
    PaymentModule,
    FundModule,
    StatsModule,
    MagicboxModule,
    SubmitterModule,
    DialogModule,
    NanoModule,
    AppmodelModule,
    DialogModule,
    SecurityModule,
  ],
  providers: [...aliasProviders],
  controllers: [MagicboxController, MagicboxCollectionController, SubmitterController]
})
export class AppModule { }
