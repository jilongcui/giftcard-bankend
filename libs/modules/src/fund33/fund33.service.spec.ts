import { Test, TestingModule } from '@nestjs/testing';
import { Fund33Service } from './fund33.service';

describe('Fund33Service', () => {
  let service: Fund33Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Fund33Service],
    }).compile();

    service = module.get<Fund33Service>(Fund33Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login', () => {
    
  })
});
