import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';
import { UploadModule } from '../common/upload/upload.module';
import { MulterModule } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as moment from 'moment';
import * as multer from 'multer';
import { extname, join } from 'path';
import { HttpModule } from '@nestjs/axios';

export let storage = multer.diskStorage({
  // 配置上传文件夹
  destination: async (req, file, cd) => {
      let currentDate = moment().format('YYYYMMDD')
      let path = join('/var/www/public', `/pdf/${currentDate}`)
      try {
          // 判断是否有该文件夹
          await fs.promises.stat(path)
      } catch (error) {
          // 没有该文件夹就创建
          await fs.promises.mkdir(path, { recursive: true })
      }
      // 挂载文件存储的路径
      req.query.fileName = '/pdf/' + currentDate + '/'
      cd(null, path)
  },
  // 配置上传文件名
  filename: (req, file, cd) => {
      // Date.now() + '-'
      const uniqueSuffix = Math.round(Math.random() * 1E9).toString()
      // 挂载文件存储的路径
      const extName = extname(file.originalname)
      req.query.fileName = req.query.fileName + uniqueSuffix + extName
      cd(null, uniqueSuffix + extName)
  }
})

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    MulterModule.register({
      storage: storage,
      preservePath: false,
    }),
    UploadModule
  ],
  controllers: [PdfController],
  providers: [PdfService]
})
export class PdfModule {}
