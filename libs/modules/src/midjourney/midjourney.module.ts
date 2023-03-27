import { Module } from '@nestjs/common';
import { MidjourneyService } from './midjourney.service';
import { MidjourneyController } from './midjourney.controller';

@Module({
  controllers: [MidjourneyController],
  providers: [MidjourneyService]
})
export class MidjourneyModule {}
