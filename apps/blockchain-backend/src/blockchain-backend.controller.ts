import { Controller, Get } from '@nestjs/common';
import { BlockchainBackendService } from './blockchain-backend.service';

@Controller()
export class BlockchainBackendController {
  constructor(private readonly blockchainBackendService: BlockchainBackendService) {}

  @Get()
  getHello(): string {
    return this.blockchainBackendService.getHello();
  }
}
