import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Fund33Service } from './fund33.service';
import { CreateFund33Dto } from './dto/create-fund33.dto';
import { UpdateFund33Dto } from './dto/update-fund33.dto';

@Controller('fund33')
export class Fund33Controller {
  constructor(private readonly fund33Service: Fund33Service) {}

  @Post()
  create(@Body() createFund33Dto: CreateFund33Dto) {
    return this.fund33Service.create(createFund33Dto);
  }

  @Get()
  findAll() {
    return this.fund33Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fund33Service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFund33Dto: UpdateFund33Dto) {
    return this.fund33Service.update(+id, updateFund33Dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fund33Service.remove(+id);
  }
}
