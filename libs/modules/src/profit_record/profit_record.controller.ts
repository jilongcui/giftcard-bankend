import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProfitRecordService } from './profit_record.service';
import { CreateProfitRecordDto } from './dto/create-profit_record.dto';
import { UpdateProfitRecordDto } from './dto/update-profit_record.dto';

@Controller('profit-record')
export class ProfitRecordController {
  constructor(private readonly profitRecordService: ProfitRecordService) {}

  @Post()
  create(@Body() createProfitRecordDto: CreateProfitRecordDto) {
    return this.profitRecordService.create(createProfitRecordDto);
  }

  @Get()
  findAll() {
    return this.profitRecordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profitRecordService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfitRecordDto: UpdateProfitRecordDto) {
    return this.profitRecordService.update(+id, updateProfitRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profitRecordService.remove(+id);
  }
}
