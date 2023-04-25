import { Module } from '@nestjs/common';
import { HomeAddressService } from './homeaddress.service';
import { HomeAddressController } from './homeaddress.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeAddress } from './entities/homeaddress.entity';
import { User } from '../system/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HomeAddress, User]),
  ],
  controllers: [HomeAddressController],
  providers: [HomeAddressService],
  exports: [HomeAddressService]
})
export class HomeAddressModule {}
