import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from '../collection/entities/collection.entity';
import { Activity } from './entities/activity.entity';
import { PreemptionWhitelist } from '../assistant/preemption/entities/preemptionWhitelist.entity';
import { PreemptionActivity } from '../assistant/preemption/entities/preemption-activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, PreemptionWhitelist, PreemptionActivity, Collection])],
  controllers: [ActivityController],
  providers: [ActivityService]
})
export class ActivityModule { }
