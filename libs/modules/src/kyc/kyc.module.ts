import { Module, forwardRef } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { Kyc } from './entities/kyc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fund33Module } from '../fund33/fund33.module';
import { SharedModule } from '@app/shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kyc]),
    SharedModule, Fund33Module
  ],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService]
})
export class KycModule {}
