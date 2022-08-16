import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { AddressBTC, AddressCRI, AddressETH, AddressTRC } from './entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AddressETH, AddressBTC, AddressTRC, AddressCRI]),
    ClientsModule.register([
      { name: 'CHAIN_SERVICE', transport: Transport.TCP, options: { port: 4000 } },
    ])],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService]
})
export class AddressModule { }
