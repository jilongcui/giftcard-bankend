import { Injectable, Logger } from '@nestjs/common';
import { CreateScreenshotDto, SetCreateScreenshotDto } from './dto/create-screenshot.dto';
import { UpdateScreenshotDto } from './dto/update-screenshot.dto';
import { InjectBrowser } from 'nest-puppeteer';
import { Browser } from 'puppeteer';
import type { BrowserContext } from 'puppeteer';
import { InjectContext } from 'nest-puppeteer';
import {KnownDevices} from 'puppeteer';
import { UploadService } from '../common/upload/upload.service';
import strRandom from 'string-random';

@Injectable()
export class ScreenshotService {

  logger: Logger

  constructor(
    @InjectBrowser() private readonly browser: Browser,
    private readonly uploadService: UploadService,
  ) {
    this.logger = new Logger(ScreenshotService.name)
  }
  async create(createScreenshotDto: CreateScreenshotDto) {

    let screenshot
    try {
      const iPhone = KnownDevices['iPhone X'];
      const page = await this.browser.newPage();
      await page.emulate(iPhone)
      await page.goto(createScreenshotDto.url, {
        // waitUntil: ['load', 'domcontentloaded']
        waitUntil: 'networkidle0'
        // waitUntil: 'load', timeout: 0 
      });
      // await page.waitForNavigation({
      //   waitUntil: "load",
      //   timeout: 0
      // })
      // await page.waitForSelector('.load-complete')
      // return page
      screenshot = await page.screenshot({
        fullPage: true,
        // quality: 100,
        type: 'png'
      });
      page.close()
      const fileName = strRandom(8).toLowerCase() + '.png'
      const fullName = 'screenshot' + '/' + fileName
      // this.logger.debug(screenshot)
      const url = await this.uploadService.uploadBufferToCos(fullName, screenshot)
      return {
          fileName,
          location: url,
      }

    } catch (err) {
      console.log(err)
    }
    
    return screenshot
  }

  async setCreate(createScreenshotDto: SetCreateScreenshotDto) {

    let screenshot
    try {
      const iPhone = KnownDevices['iPhone X'];
      const page = await this.browser.newPage();
      await page.emulate(iPhone)
      await page.setContent(createScreenshotDto.content, {
        waitUntil: ['load', 'domcontentloaded']
        // waitUntil: 'networkidle0'
        // waitUntil: 'load', timeout: 0 
      });
      // await page.waitForNavigation({
      //   waitUntil: "load",
      //   timeout: 0
      // })
      // await page.waitForSelector('.load-complete')
      // return page
      screenshot = await page.screenshot({
        fullPage: true,
        // quality: 100,
        type: 'png'
      });
      page.close()
      const fileName = strRandom(8).toLowerCase() + '.png'
      const fullName = 'screenshot' + '/' + fileName
      // this.logger.debug(screenshot)
      const url = await this.uploadService.uploadBufferToCos(fullName, screenshot)
      return {
          fileName,
          location: url,
      }

    } catch (err) {
      console.log(err)
    }
    
    return screenshot
  }

  findAll() {
    return `This action returns all screenshot`;
  }

  findOne(id: number) {
    return `This action returns a #${id} screenshot`;
  }

  update(id: number, updateScreenshotDto: UpdateScreenshotDto) {
    return `This action updates a #${id} screenshot`;
  }

  remove(id: number) {
    return `This action removes a #${id} screenshot`;
  }
}

