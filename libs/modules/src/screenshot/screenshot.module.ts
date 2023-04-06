import { Module } from '@nestjs/common';
import { ScreenshotService } from './screenshot.service';
import { ScreenshotController } from './screenshot.controller';
import { PuppeteerModule } from 'nest-puppeteer';
import { UploadModule } from '../common/upload/upload.module';

@Module({
  imports: [
    UploadModule
  ],

  controllers: [ScreenshotController],
  providers: [ScreenshotService],
  exports: [ScreenshotService]
})
export class ScreenshotModule {}
