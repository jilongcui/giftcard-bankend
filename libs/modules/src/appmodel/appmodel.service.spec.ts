import { Test, TestingModule } from '@nestjs/testing';
import { AppmodelService } from './appmodel.service';

describe('AppmodelService', () => {
  let service: AppmodelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppmodelService],
    }).compile();

    service = module.get<AppmodelService>(AppmodelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
