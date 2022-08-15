import { Module } from '@nestjs/common';
import { UserModule } from '@app/user';
import { HelloworldController } from './helloworld/helloworld.controller';

@Module({
  imports: [UserModule],
  controllers: [HelloworldController]
})
export class AppModule { }
