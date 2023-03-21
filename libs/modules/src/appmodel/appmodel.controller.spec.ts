import { Test, TestingModule } from '@nestjs/testing';
import { AppmodelController } from './appmodel.controller';
import { AppmodelService } from './appmodel.service';

describe('AppmodelController', () => {
  let controller: AppmodelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppmodelController],
      providers: [AppmodelService],
    }).compile();

    controller = module.get<AppmodelController>(AppmodelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
