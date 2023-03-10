import { DynamicModule, Module } from '@nestjs/common';
import { EngineGateway } from './engine.gateway';
import { Appmodel } from '../appmodel/entities/appmodel.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createEngineProviders } from './engine.providers';
import { EngineChatService } from './engine-chat.service';
import { EngineCompleteService } from './engine-complete.service';
import { EngineImageService } from './engine-image.service';
import { UploadModule } from '../common/upload/upload.module';

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
        TypeOrmModule.forFeature([Appmodel]),
        UploadModule
      ],
      providers: [EngineChatService, EngineImageService, EngineCompleteService],
      exports: [EngineChatService, EngineImageService, EngineCompleteService]
    }
  }
}
