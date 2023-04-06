import { Test, TestingModule } from '@nestjs/testing';
import { ScreenshotController } from './screenshot.controller';
import { ScreenshotService } from './screenshot.service';

describe('ScreenshotController', () => {
  let controller: ScreenshotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScreenshotController],
      providers: [ScreenshotService],
    }).compile();

    controller = module.get<ScreenshotController>(ScreenshotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
