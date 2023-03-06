import { DynamicModule, Module } from '@nestjs/common';
import { EngineGateway } from './engine.gateway';
import { Appmodel } from '../appmodel/entities/appmodel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createEngineProviders } from './engine.providers';
import { EngineChatService } from './engine-chat.service';
import { EngineCompleteService } from './engine-complete.service';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Appmodel])
//   ],
//   providers: [EngineGateway, EngineService],
//   exports: [EngineService]
// })
export class EngineModule {
  static forRoot(): DynamicModule {
    // const engineProviders = createEngineProviders();
    return {
      module: EngineModule,
      imports: [
        TypeOrmModule.forFeature([Appmodel])
      ],
      providers: [EngineChatService, EngineCompleteService],
      exports: [EngineChatService, EngineCompleteService]
    }
  }
}
