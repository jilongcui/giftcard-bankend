import { Module } from '@nestjs/common';
import { DialogService } from './dialog.service';
import { DialogGateway } from './dialog.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dialog } from './entities/dialog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dialog]),
  ],
  providers: [DialogGateway, DialogService]
})
export class DialogModule {}
