import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';

@Module({
  imports: [HttpModule.register({
    timeout: 5000,
    maxRedirects: 5,
  }),
  ClientsModule.register([
    { name: 'CHAIN_SERVICE', transport: Transport.TCP, options: { port: 4000 } },
  ]),
  TypeOrmModule.forFeature([Identity])],
  controllers: [IdentityController],
  providers: [IdentityService]
})
export class IdentityModule { }
