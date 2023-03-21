import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { CreatePdfDto, ParsePdfDto } from './dto/create-pdf.dto';
import { UpdatePdfDto } from './dto/update-pdf.dto';
import { Public } from '@app/common/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { ApiFile } from '../common/upload/upload.controller';
import { UploadService } from '../common/upload/upload.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService,
    private readonly uploadService: UploadService
  ) {}

  @Post()
  create(@Body() createPdfDto: CreatePdfDto) {
    return this.pdfService.create(createPdfDto);
  }

  /* 单文件上传到Cos */
  @Post('uploadCos')
  @Public()
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileCos(@UploadedFile() file: Express.Multer.File, @Query('fileName') fileName) {
      const fullName = '/pdf/' + fileName
      const url = await this.uploadService.uploadToCos(fileName, file.path)

      return {
          fileName,
          originalname: file.originalname,
          mimetype: file.mimetype,
          location: url,
      }
  }

  @Post('parse')
  parse(@Body() parsePdfDto: ParsePdfDto) {
    return this.pdfService.parse(parsePdfDto.fileurl);
  }

  @Get()
  findAll() {
    return this.pdfService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pdfService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePdfDto: UpdatePdfDto) {
    return this.pdfService.update(+id, updatePdfDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pdfService.remove(+id);
  }
}
