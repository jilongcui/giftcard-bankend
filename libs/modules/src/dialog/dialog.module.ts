import { Module } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { DialogGateway } from './dialog.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dialog } from './entities/dialog.entity';
import { Nano } from '../nano/entities/nano.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dialog, Nano]),
  ],
  providers: [DialogGateway, DialogService],
  exports: [DialogService]
})
export class DialogModule {}
