import { Module } from '@nestjs/common';
import { PromotionAgentService } from './promotion_agent.service';
import { PromotionAgentController } from './promotion_agent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kyc } from '../kyc/entities/kyc.entity';
import { Bankcard } from '../bankcard/entities/bankcard.entity';
import { User } from '../system/user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { SharedModule } from '@app/shared';
import { SysConfigModule } from '../system/sys-config/sys-config.module';
import { PromotionAgent } from './entities/promotion_agent.entity';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromotionAgent]),
    SharedModule, SysConfigModule, CurrencyModule
  ],
  controllers: [PromotionAgentController],
  providers: [PromotionAgentService],
  exports: [PromotionAgentService]
})
export class PromotionAgentModule {}
