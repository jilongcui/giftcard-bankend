import { Test, TestingModule } from '@nestjs/testing';
import { BankcardService } from './bankcard.service';

describe('BankcardService', () => {
  let service: BankcardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BankcardService],
    }).compile();

    service = module.get<BankcardService>(BankcardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
