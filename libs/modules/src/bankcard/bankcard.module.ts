import { Module } from '@nestjs/common';
import { BankcardService } from './bankcard.service';
import { BankcardController } from './bankcard.controller';
import { Bankcard } from './entities/bankcard.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bankcard]), IdentityModule],
  controllers: [BankcardController],
  providers: [BankcardService],
  exports: [BankcardService]
})
export class BankcardModule { }
