import { Module } from '@nestjs/common';
import { BlockchainBackendController } from './blockchain-backend.controller';
import { BlockchainBackendService } from './blockchain-backend.service';

@Module({
  imports: [],
  controllers: [BlockchainBackendController],
  providers: [BlockchainBackendService],
})
export class BlockchainBackendModule {}
