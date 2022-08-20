import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { AddressModule } from './wallet/address/address.module';

@Module({
  providers: [ModulesService],
  exports: [ModulesService],
  imports: [AddressModule],
})
export class ModulesModule { }
