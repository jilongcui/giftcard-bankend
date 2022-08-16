import { SharedModule } from '@app/shared';
import { Module } from '@nestjs/common';
import { ChainService } from './chain.service';

@Module({
  providers: [SharedModule, ChainService],
  exports: [ChainService],
})
export class ChainModule { }
