import { Injectable, Logger } from '@nestjs/common';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { UpdatePdfDto } from './dto/update-pdf.dto';
import * as fs from "fs";
import * as PDFParser from "pdf2json";
import path, { join } from 'path';

import { UploadService } from '../common/upload/upload.service';
const http = require("http");
const request =  require('request');

@Injectable()
export class PdfService {

  pdfParser: PDFParser
  logger = new Logger(PdfService.name)

  constructor(
    private readonly uploadService: UploadService,
  ) {
    this.pdfParser = new PDFParser(this,1);
  }
  create(createPdfDto: CreatePdfDto) {
    return 'This action adds a new pdf';
  }

  findAll() {
    return `This action returns all pdf`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pdf`;
  }

  update(id: number, updatePdfDto: UpdatePdfDto) {
    return `This action updates a #${id} pdf`;
  }

  remove(id: number) {
    return `This action removes a #${id} pdf`;
  }

  parse(fileurl: string) {
    this.logger.debug(fileurl)
    // const filename = path.basename(fileurl)
    this.pdfParser.on("pdfParser_dataError", errData => this.logger.debug(errData) );
    this.pdfParser.on("pdfParser_dataReady", pdfData => {
      
      // this.logger.debug(JSON.stringify(pdfData))
      this.logger.debug(this.pdfParser.getRawTextContent())
      // fs.writeFile(filename, JSON.stringify(pdfData));
    })

    // const file = fs.createWriteStream(filename);
    // http.get(fileurl, response => {
    //   response.pipe(this.pdfParser.createParserStream());
    // });
    // let stream = fs.createWriteStream('/var/www/public/pdf/' + '1.pdf')
    

    // this.pdfParser.on("readable", meta => this.logger.debug("PDF Metadata", meta) );
    // this.pdfParser.on("data", page => this.logger.debug(page ? "One page paged" : "All pages parsed", page));

    // this.pdfParser.loadPDF(filename);
    let stream = this.pdfParser.createParserStream()
    request(fileurl).pipe(stream).on("close", function(err) {
      this.logger.debug("下载完毕")
    })
  }
}
