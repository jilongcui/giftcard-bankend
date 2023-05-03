import { Test, TestingModule } from '@nestjs/testing';
import { ProfitRecordController } from './profit_record.controller';
import { ProfitRecordService } from './profit_record.service';

describe('ProfitRecordController', () => {
  let controller: ProfitRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfitRecordController],
      providers: [ProfitRecordService],
    }).compile();

    controller = module.get<ProfitRecordController>(ProfitRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
