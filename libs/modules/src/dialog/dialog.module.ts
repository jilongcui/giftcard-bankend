import { Module } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { DialogGateway } from './dialog.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dialog } from './entities/dialog.entity';
import { Nano } from '../nano/entities/nano.entity';
import { NanoModule } from '../nano/nano.module';
import { EngineModule } from '../engine/engine.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dialog, Nano]),
    NanoModule, EngineModule
  ],
  providers: [DialogGateway, DialogService],
  exports: [DialogService]
})
export class DialogModule {}
