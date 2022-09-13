import { Module } from '@nestjs/common'
import { ChainModule } from '@app/chain'
import { HelloworldController } from './helloworld/helloworld.controller'
import { ChainController } from './chain/chain.controller'
import { ConfigModule } from '@nestjs/config'
import configuration from 'apps/nestjs-backend/src/config/configuration'
import { Contract } from '@app/modules/contract/entities/contract.entity'
import { ContractModule } from '@app/modules/contract/contract.module'
import { SharedModule } from '@app/shared'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    /* 公共模块 */
    // SharedModule,
    ChainModule],
  controllers: [HelloworldController, ChainController]
})
export class AppModule { }
