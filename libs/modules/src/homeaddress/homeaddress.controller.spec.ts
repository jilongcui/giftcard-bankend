import { Test, TestingModule } from '@nestjs/testing';
import { HomeaddressController } from './homeaddress.controller';
import { HomeaddressService } from './homeaddress.service';

describe('HomeaddressController', () => {
  let controller: HomeaddressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeaddressController],
      providers: [HomeaddressService],
    }).compile();

    controller = module.get<HomeaddressController>(HomeaddressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
