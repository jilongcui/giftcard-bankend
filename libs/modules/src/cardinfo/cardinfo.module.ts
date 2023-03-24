import { Module } from '@nestjs/common';
import { CardinfoService } from './cardinfo.service';
import { CardinfoController } from './cardinfo.controller';

@Module({
  controllers: [CardinfoController],
  providers: [CardinfoService]
})
export class CardinfoModule {}
