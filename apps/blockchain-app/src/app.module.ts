import { Module } from '@nestjs/common'
import { ChainModule } from '@app/chain'
import { HelloworldController } from './helloworld/helloworld.controller'
import { ChainController } from './chain/chain.controller'

@Module({
  imports: [ChainModule],
  controllers: [HelloworldController, ChainController]
})
export class AppModule { }
