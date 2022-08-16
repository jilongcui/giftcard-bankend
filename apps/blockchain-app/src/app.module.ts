import { Module } from '@nestjs/common'
import { ChainModule } from '@app/chain'
import { HelloworldController } from './helloworld/helloworld.controller'
import { ChainController } from './chain/chain.controller'
import { ConfigModule } from '@nestjs/config'
import configuration from 'apps/nestjs-backend/src/config/configuration'

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    load: [configuration]
  }), ChainModule],
  controllers: [HelloworldController, ChainController]
})
export class AppModule { }
