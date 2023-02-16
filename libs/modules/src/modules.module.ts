import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { NanoModule } from './nano/nano.module';
import { DialogModule } from './dialog/dialog.module';

@Module({
  providers: [ModulesService],
  exports: [ModulesService],
  imports: [],
})
export class ModulesModule { }
