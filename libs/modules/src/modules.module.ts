import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ExchangeModule } from './exchange/exchange.module';
import { ProfitRecordModule } from './profit_record/profit_record.module';

@Module({
  providers: [ModulesService],
  exports: [ModulesService],
  imports: [ExchangeModule, ProfitRecordModule],
})
export class ModulesModule { }
