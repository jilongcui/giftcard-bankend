import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { AddressBTC, AddressETH, AddressTRC } from './entities/Address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AddressETH, AddressBTC, AddressTRC])],
  controllers: [AddressController],
  providers: [AddressService]
})
export class AddressModule { }
