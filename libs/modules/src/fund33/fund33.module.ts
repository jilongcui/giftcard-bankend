import { Module } from '@nestjs/common';
import { Fund33Service } from './fund33.service';
import { Fund33Controller } from './fund33.controller';
import { HttpModule } from '@nestjs/axios';
import { SharedModule } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bankcard } from '../bankcard/entities/bankcard.entity';
import { WithdrawController } from './withdraw.controller';
<<<<<<< HEAD
=======
import { WithdrawService } from './withdraw.service';
>>>>>>> 98a0b82 (Add fund33 withraw modules.)

@Module({
  imports: [
    TypeOrmModule.forFeature([Bankcard]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    SharedModule,
  ],
  controllers: [Fund33Controller, WithdrawController],
<<<<<<< HEAD
  providers: [Fund33Service],
  exports: [Fund33Service]
=======
  providers: [Fund33Service, WithdrawService],
  exports: [Fund33Service,WithdrawService]
>>>>>>> 98a0b82 (Add fund33 withraw modules.)
})
export class Fund33Module {}
