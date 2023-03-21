import { Injectable, Logger } from '@nestjs/common';
import { CreatePdfDto } from './dto/create-pdf.dto';
import { UpdatePdfDto } from './dto/update-pdf.dto';
import fs from "fs";
import PDFParser from "pdf2json";
import path, { join } from 'path';

import { UploadService } from '../common/upload/upload.service';
const http = require("http");

@Injectable()
export class PdfService {

  pdfParser: PDFParser
  logger = new Logger(PdfService.name)

  constructor(
    private readonly uploadService: UploadService,
  ) {
    this.pdfParser = new PDFParser();
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
    // const filename = path.basename(fileurl)
    this.pdfParser.on("pdfParser_dataError", errData => this.logger.debug(errData) );
    this.pdfParser.on("pdfParser_dataReady", pdfData => {
      this.logger.debug(JSON.stringify(pdfData))
      // fs.writeFile(filename, JSON.stringify(pdfData));
    })

    // const file = fs.createWriteStream(filename);
    http.get(fileurl, response => {
      response.pipe(this.pdfParser.createParserStream());
    });

    this.pdfParser.on("readable", meta => this.logger.debug("PDF Metadata", meta) );
    this.pdfParser.on("data", page => this.logger.debug(page ? "One page paged" : "All pages parsed", page));

    // this.pdfParser.loadPDF(filename);

  }
}
