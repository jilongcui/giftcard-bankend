import { Test, TestingModule } from '@nestjs/testing';
import { BankcardController } from './bankcard.controller';
import { BankcardService } from './bankcard.service';

describe('BankcardController', () => {
  let controller: BankcardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BankcardController],
      providers: [BankcardService],
    }).compile();

    controller = module.get<BankcardController>(BankcardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
