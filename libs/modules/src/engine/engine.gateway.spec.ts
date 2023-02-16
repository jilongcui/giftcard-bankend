import { Test, TestingModule } from '@nestjs/testing';
import { EngineGateway } from './engine.gateway';
import { EngineService } from './engine.service';

describe('EngineGateway', () => {
  let gateway: EngineGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EngineGateway, EngineService],
    }).compile();

    gateway = module.get<EngineGateway>(EngineGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
