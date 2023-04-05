import { Module } from '@nestjs/common';
import { ApplyCardService } from './apply-card.service';
import { ApplyCardController } from './apply-card.controller';
import { CardinfoModule } from '../cardinfo/cardinfo.module';
import { KycModule } from '../kyc/kyc.module';
import { ApplyCard } from './entities/apply-card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../system/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplyCard]),
    CardinfoModule, KycModule
  ],
  controllers: [ApplyCardController],
  providers: [ApplyCardService]
})
export class ApplyCardModule {}
