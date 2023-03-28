import { Module } from '@nestjs/common';
import { Fund33Service } from './fund33.service';
import { Fund33Controller } from './fund33.controller';
import { HttpModule } from '@nestjs/axios';
import { SharedModule } from '@app/shared';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bankcard } from '../bankcard/entities/bankcard.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bankcard]),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    SharedModule,
  ],
  controllers: [Fund33Controller],
  providers: [Fund33Service]
})
export class Fund33Module {}
