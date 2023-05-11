import { Test, TestingModule } from '@nestjs/testing';
import { PromotionAgentService } from './promotion_agent.service';

describe('PromotionAgentService', () => {
  let service: PromotionAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionAgentService],
    }).compile();

    service = module.get<PromotionAgentService>(PromotionAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
