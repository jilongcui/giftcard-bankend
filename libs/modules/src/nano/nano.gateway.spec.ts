import { Test, TestingModule } from '@nestjs/testing';
import { NanoGateway } from './nano.gateway';
import { NanoService } from './nano.service';

describe('NanoGateway', () => {
  let gateway: NanoGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NanoGateway, NanoService],
    }).compile();

    gateway = module.get<NanoGateway>(NanoGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
