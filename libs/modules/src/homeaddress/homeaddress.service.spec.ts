import { Test, TestingModule } from '@nestjs/testing';
import { HomeaddressService } from './homeaddress.service';

describe('HomeaddressService', () => {
  let service: HomeaddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HomeaddressService],
    }).compile();

    service = module.get<HomeaddressService>(HomeaddressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
