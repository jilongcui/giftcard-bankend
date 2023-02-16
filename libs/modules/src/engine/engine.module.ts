import { Module } from '@nestjs/common';
import { EngineService } from './engine.service';
import { EngineGateway } from './engine.gateway';

@Module({
  providers: [EngineGateway, EngineService],
  exports: [EngineService]
})
export class EngineModule {}
