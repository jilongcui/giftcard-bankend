import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirdropWhitelistService } from './airdrop-whitelist.service';
import { AirdropWhitelistController } from './airdrop-whitelist.controller';
import { AirdropActivity } from './entities/airdrop-activity.entity';
import { AirdropWhitelist } from './entities/airdrop-whitelist.entity';
import { AirdropActivityService } from './airdrop-activity.service';
import { AirdropActivityController } from './airdrop-activity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AirdropWhitelist, AirdropActivity])],
  controllers: [AirdropWhitelistController, AirdropActivityController],
  providers: [AirdropWhitelistService, AirdropActivityService]
})
export class AirdropModule { }
