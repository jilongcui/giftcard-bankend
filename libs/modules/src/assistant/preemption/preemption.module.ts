import { Module } from '@nestjs/common';
import { PreemptionWhiteListService } from './preemptionWhitelist.service';
import { PreemptionWhiteController } from './preemptionWhitelist.controller';
import { Preemption } from './entities/preemption.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreemptionWhitelist } from './entities/preemptionWhitelist.entity';
import { PreemptionService } from './preemption.service';
import { PreemptionController } from './preemption.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PreemptionWhitelist, Preemption])],
  controllers: [PreemptionWhiteController, PreemptionController],
  providers: [PreemptionWhiteListService, PreemptionService]
})
export class PreemptionModule { }
