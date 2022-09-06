import { Module } from '@nestjs/common';
import { FundService } from './fund.service';
import { FundController } from './fund.controller';

@Module({
  providers: [FundService],
  controllers: [FundController]
})
export class FundModule {}
