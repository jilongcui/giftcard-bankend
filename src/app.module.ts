import { SysConfigModule } from './modules/system/sys-config/sys-config.module';
import { CommonModule } from './modules/common/common.module';
import { LoginModule } from './modules/login/login.module';
import { SharedModule } from './shared/shared.module';
import { ExistingProvider, Module } from '@nestjs/common';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/system/auth/auth.module';
import { UserModule } from './modules/system/user/user.module';
import { DictModule } from './modules/system/dict/dict.module';
import { NoticeModule } from './modules/system/notice/notice.module';
import { PostModule } from './modules/system/post/post.module';
import { DeptModule } from './modules/system/dept/dept.module';
import { MenuModule } from './modules/system/menu/menu.module';
import { RoleModule } from './modules/system/role/role.module';
import { LogModule } from './modules/monitor/log/log.module';
import { OnlineModule } from './modules/monitor/online/online.module';
import { JobModule } from './modules/monitor/job/job.module';
import { ServerModule } from './modules/monitor/server/server.module';
import { JobService } from './modules/monitor/job/job.service';
import { AddressModule } from './modules/wallet/address/address.module';
import { CollectModule } from './modules/wallet/collect/collect.module';
import { IdentityModule } from './modules/identity/identity.module';
import { SmscodeModule } from './modules/smscode/smscode.module';
import { ProductModule } from './modules/product/product.module';
import { ActivityModule } from './modules/activity/activity.module';
import { OrderModule } from './modules/order/order.module';
import { ContractModule } from './modules/contract/contract.module';
import { CurrencyModule } from './modules/currency/currency.module';
import { AccountModule } from './modules/account/account.module';

/* 将 provider的类名作为别名，方便定时器调用 */
const providers = [JobService]
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
    SmscodeModule,
    ProductModule,
    ActivityModule,
    OrderModule,
    ContractModule,
    CurrencyModule,
    AccountModule
  ],
  providers: [...aliasProviders]
})
export class AppModule { }
