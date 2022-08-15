import { Module } from '@nestjs/common';
import { UserModule } from '@app/user';

@Module({
  imports: [UserModule],
  controllers: []
})
export class BlockchainAppModule { }
