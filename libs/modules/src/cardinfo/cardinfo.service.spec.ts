import { Test, TestingModule } from '@nestjs/testing';
import { CardinfoService } from './cardinfo.service';

describe('CardinfoService', () => {
  let service: CardinfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardinfoService],
    }).compile();

    service = module.get<CardinfoService>(CardinfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
