import { Test, TestingModule } from '@nestjs/testing';
import { ProfitRecordService } from './profit_record.service';

describe('ProfitRecordService', () => {
  let service: ProfitRecordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfitRecordService],
    }).compile();

    service = module.get<ProfitRecordService>(ProfitRecordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
