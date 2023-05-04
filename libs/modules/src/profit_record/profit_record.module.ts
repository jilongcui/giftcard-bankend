import { Module } from '@nestjs/common';
import { ProfitRecordService } from './profit_record.service';
import { ProfitRecordController } from './profit_record.controller';
import { ProfitRecord } from './entities/profit_record.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfitRecord]),
  ],
  controllers: [ProfitRecordController],
  providers: [ProfitRecordService],
  exports: [ProfitRecordService]
})
export class ProfitRecordModule {}
