import { Module } from '@nestjs/common';
import { ProfitRecordService } from './profit_record.service';
import { ProfitRecordController } from './profit_record.controller';

@Module({
  controllers: [ProfitRecordController],
  providers: [ProfitRecordService]
})
export class ProfitRecordModule {}
