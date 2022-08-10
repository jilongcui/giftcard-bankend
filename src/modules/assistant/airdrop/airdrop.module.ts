import { Module } from '@nestjs/common';
import { AirdropService } from './airdrop.service';
import { AirdropController } from './airdrop.controller';

@Module({
  controllers: [AirdropController],
  providers: [AirdropService]
})
export class AirdropModule {}
