import { Test, TestingModule } from '@nestjs/testing';
import { MagicboxController } from './magicbox.controller';

describe('MagicboxController', () => {
  let controller: MagicboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MagicboxController],
    }).compile();

    controller = module.get<MagicboxController>(MagicboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
