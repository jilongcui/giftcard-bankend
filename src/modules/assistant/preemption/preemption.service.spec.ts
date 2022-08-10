import { Test, TestingModule } from '@nestjs/testing';
import { PreemptionService } from './preemption.service';

describe('PreemptionService', () => {
  let service: PreemptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreemptionService],
    }).compile();

    service = module.get<PreemptionService>(PreemptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
