import { Module } from '@nestjs/common';
import { NanoService } from './nano.service';
import { NanoGateway } from './nano.gateway';

@Module({
  providers: [NanoGateway, NanoService]
})
export class NanoModule {}
