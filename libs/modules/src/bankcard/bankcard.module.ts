import { Module } from '@nestjs/common';
import { BankcardService } from './bankcard.service';
import { BankcardController } from './bankcard.controller';

@Module({
  controllers: [BankcardController],
  providers: [BankcardService]
})
export class BankcardModule {}
