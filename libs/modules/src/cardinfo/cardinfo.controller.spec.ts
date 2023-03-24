import { Test, TestingModule } from '@nestjs/testing';
import { CardinfoController } from './cardinfo.controller';
import { CardinfoService } from './cardinfo.service';

describe('CardinfoController', () => {
  let controller: CardinfoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardinfoController],
      providers: [CardinfoService],
    }).compile();

    controller = module.get<CardinfoController>(CardinfoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
