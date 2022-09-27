import { Test, TestingModule } from '@nestjs/testing';
import { MagicboxCollectionController } from './magicbox-collection.controller';

describe('MagicboxCollectionController', () => {
  let controller: MagicboxCollectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MagicboxCollectionController],
    }).compile();

    controller = module.get<MagicboxCollectionController>(MagicboxCollectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
