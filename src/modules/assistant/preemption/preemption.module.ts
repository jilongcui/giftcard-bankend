import { Module } from '@nestjs/common';
import { PreemptionService } from './preemption.service';
import { PreemptionController } from './preemption.controller';
import { PreemptionActivity } from './entities/preemption-activity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preemption } from './entities/preemption.entity';
import { PreemptionActivityService } from './preemption-activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Preemption, PreemptionActivity])],
  controllers: [PreemptionController],
  providers: [PreemptionService, PreemptionActivityService]
})
export class PreemptionModule { }
