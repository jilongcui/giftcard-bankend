import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainBackendController } from './blockchain-backend.controller';
import { BlockchainBackendService } from './blockchain-backend.service';

describe('BlockchainBackendController', () => {
  let blockchainBackendController: BlockchainBackendController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BlockchainBackendController],
      providers: [BlockchainBackendService],
    }).compile();

    blockchainBackendController = app.get<BlockchainBackendController>(BlockchainBackendController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(blockchainBackendController.getHello()).toBe('Hello World!');
    });
  });
});
