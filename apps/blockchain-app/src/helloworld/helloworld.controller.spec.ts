import { Test, TestingModule } from '@nestjs/testing';
import { HelloworldController } from './helloworld.controller';

describe('HelloworldController', () => {
  let controller: HelloworldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HelloworldController],
    }).compile();

    controller = module.get<HelloworldController>(HelloworldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
