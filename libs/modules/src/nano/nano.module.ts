import { Module } from '@nestjs/common';
import { NanoService } from './nano.service';
import { NanoGateway } from './nano.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dialog } from '../dialog/entities/dialog.entity';
import { Nano } from './entities/nano.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dialog, Nano]),
  ],
  providers: [NanoGateway, NanoService],
  exports: [NanoService],
})
export class NanoModule {}
