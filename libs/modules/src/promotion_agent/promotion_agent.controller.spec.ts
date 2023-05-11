import { Test, TestingModule } from '@nestjs/testing';
import { PromotionAgentController } from './promotion_agent.controller';
import { PromotionAgentService } from './promotion_agent.service';

describe('PromotionAgentController', () => {
  let controller: PromotionAgentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionAgentController],
      providers: [PromotionAgentService],
    }).compile();

    controller = module.get<PromotionAgentController>(PromotionAgentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
