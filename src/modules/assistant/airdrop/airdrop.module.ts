import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirdropService } from './airdrop.service';
import { AirdropController } from './airdrop.controller';
import { AirdropActivity } from './entities/airdrop-activity.entity';
import { Airdrop } from './entities/airdrop.entity';
import { AirdropActivityService } from './airdrop-activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Airdrop, AirdropActivity])],
  controllers: [AirdropController],
  providers: [AirdropService, AirdropActivityService]
})
export class AirdropModule { }
