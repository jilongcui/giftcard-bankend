import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from '../collection/entities/collection.entity';
import { Activity } from './entities/activity.entity';
import { PreemptionWhitelist } from '../assistant/preemption/entities/preemptionWhitelist.entity';
import { Preemption } from '../assistant/preemption/entities/preemption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, PreemptionWhitelist, Preemption, Collection])],
  controllers: [ActivityController],
  providers: [ActivityService]
})
export class ActivityModule { }
