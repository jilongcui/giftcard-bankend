import { Test, TestingModule } from '@nestjs/testing';
import { PreemptionController } from './preemption.controller';
import { PreemptionService } from './preemption.service';

describe('PreemptionController', () => {
  let controller: PreemptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreemptionController],
      providers: [PreemptionService],
    }).compile();

    controller = module.get<PreemptionController>(PreemptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
