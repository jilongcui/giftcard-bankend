import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainBackendService {
  getHello(): string {
    return 'Hello World!';
  }
}
