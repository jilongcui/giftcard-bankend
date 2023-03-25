import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Fund33Service } from './fund33.service';
import { CreateFund33Dto } from './dto/create-fund33.dto';
import { UpdateFund33Dto } from './dto/update-fund33.dto';

@Controller('fund33')
export class Fund33Controller {
  constructor(private readonly fund33Service: Fund33Service) {}
  // @Get()
  // findAll() {
  //   return this.fund33Service.findAll();
  // }
}
