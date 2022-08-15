import { Module } from '@nestjs/common'
import { UserModule } from '@app/user'
import { ChainModule } from '@app/chain'
import { HelloworldController } from './helloworld/helloworld.controller'
import { ChainController } from './chain/chain.controller'

@Module({
  imports: [UserModule, ChainModule],
  controllers: [HelloworldController, ChainController]
})
export class AppModule { }
