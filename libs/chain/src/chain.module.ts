import { ContractModule } from '@app/modules/contract/contract.module';
import { Contract } from '@app/modules/contract/entities/contract.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChainService } from './chain.service';

@Module({
  imports: [],
  providers: [ChainService],
  exports: [ChainService],
})
export class ChainModule { }
