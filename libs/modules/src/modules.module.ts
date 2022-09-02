import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { StatModule } from './stat/stat.module';

@Module({
  providers: [ModulesService],
  exports: [ModulesService],
  imports: [StatModule],
})
export class ModulesModule { }
