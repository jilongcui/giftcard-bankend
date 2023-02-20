import { Module } from '@nestjs/common';
import { EngineService } from './engine.service';
import { EngineGateway } from './engine.gateway';
import { Appmodel } from '../appmodel/entities/appmodel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appmodel])
  ],
  providers: [EngineGateway, EngineService],
  exports: [EngineService]
})
export class EngineModule {}
