import { Test, TestingModule } from '@nestjs/testing';
import { SmscodeController } from './smscode.controller';

describe('SmscodeController', () => {
  let controller: SmscodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SmscodeController],
    }).compile();

    controller = module.get<SmscodeController>(SmscodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
