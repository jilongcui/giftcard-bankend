import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectController } from './collect.controller';
import { CollectService } from './collect.service';
import { RechargeCollect } from './entities/rechage-collect.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RechargeCollect])],
  controllers: [CollectController],
  providers: [CollectService]
})
export class CollectModule { }
