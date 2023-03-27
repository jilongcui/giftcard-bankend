import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { Kyc } from './entities/kyc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Kyc]),
  ],
  controllers: [KycController],
  providers: [KycService],
  exports: [KycService]
})
export class KycModule {}
