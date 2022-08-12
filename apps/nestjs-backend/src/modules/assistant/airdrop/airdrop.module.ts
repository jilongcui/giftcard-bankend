import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirdropWhitelistService } from './airdrop-whitelist.service';
import { AirdropWhitelistController } from './airdrop-whitelist.controller';
import { Airdrop } from './entities/airdrop-activity.entity';
import { AirdropWhitelist } from './entities/airdrop-whitelist.entity';
import { AirdropService } from './airdrop.service';
import { AirdropController } from './airdrop.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AirdropWhitelist, Airdrop])],
  controllers: [AirdropWhitelistController, AirdropController],
  providers: [AirdropWhitelistService, AirdropService]
})
export class AirdropModule { }
