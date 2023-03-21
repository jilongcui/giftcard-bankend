import { Test, TestingModule } from '@nestjs/testing';
import { DialogGateway } from './dialog.gateway';
import { DialogService } from './dialog.service';

describe('DialogGateway', () => {
  let gateway: DialogGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DialogGateway, DialogService],
    }).compile();

    gateway = module.get<DialogGateway>(DialogGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
