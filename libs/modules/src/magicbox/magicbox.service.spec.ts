import { Test, TestingModule } from '@nestjs/testing';
import { MagicboxService } from './magicbox.service';

describe('MagicboxService', () => {
  let service: MagicboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MagicboxService],
    }).compile();

    service = module.get<MagicboxService>(MagicboxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
