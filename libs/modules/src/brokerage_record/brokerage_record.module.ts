import { Module } from '@nestjs/common';
import { BrokerageRecordService } from './brokerage_record.service';
import { BrokerageRecordController } from './brokerage_record.controller';
import { BrokerageRecord } from './entities/brokerage_record.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([BrokerageRecord]),
  ],
  controllers: [BrokerageRecordController],
  providers: [BrokerageRecordService],
  exports: [BrokerageRecordService]
})
export class BrokerageRecordModule {}
