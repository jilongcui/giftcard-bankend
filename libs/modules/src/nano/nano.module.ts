import { Module } from '@nestjs/common';
import { NanoService } from './nano.service';
import { NanoGateway } from './nano.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dialog } from '../dialog/entities/dialog.entity';
import { Nano } from './entities/nano.entity';
import { NanoController } from './nano.controller';
import { User } from '../system/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dialog, Nano, User]),
  ],
  controllers: [NanoController],
  providers: [NanoGateway, NanoService],
  exports: [NanoService],
})
export class NanoModule {}
