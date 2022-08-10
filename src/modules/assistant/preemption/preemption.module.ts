import { Module } from '@nestjs/common';
import { PreemptionWhiteListService } from './preemptionWhitelist.service';
import { PreemptionWhiteController } from './preemptionWhitelist.controller';
import { PreemptionActivity } from './entities/preemption-activity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreemptionWhitelist } from './entities/preemptionWhitelist.entity';
import { PreemptionActivityService } from './preemption-activity.service';
import { PreemptionActivityController } from './preemption-activity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PreemptionWhitelist, PreemptionActivity])],
  controllers: [PreemptionWhiteController, PreemptionActivityController],
  providers: [PreemptionWhiteListService, PreemptionActivityService]
})
export class PreemptionModule { }
