import { Test, TestingModule } from '@nestjs/testing';
import { SmscodeService } from './smscode.service';

describe('SmscodeService', () => {
  let service: SmscodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmscodeService],
    }).compile();

    service = module.get<SmscodeService>(SmscodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
