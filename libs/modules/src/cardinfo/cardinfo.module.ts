import { Module } from '@nestjs/common';
import { CardinfoService } from './cardinfo.service';
import { CardinfoController } from './cardinfo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cardinfo } from './entities/cardinfo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cardinfo])
  ],
  controllers: [CardinfoController],
  providers: [CardinfoService],
  exports: [CardinfoService]
})
export class CardinfoModule {}
