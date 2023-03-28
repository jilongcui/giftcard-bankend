import { Test, TestingModule } from '@nestjs/testing';
import { Fund33Controller } from './fund33.controller';
import { Fund33Service } from './fund33.service';

describe('Fund33Controller', () => {
  let controller: Fund33Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Fund33Controller],
      providers: [Fund33Service],
    }).compile();

    controller = module.get<Fund33Controller>(Fund33Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
