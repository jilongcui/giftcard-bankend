import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MidjourneyService } from './midjourney.service';
import { CreateMidjourneyDto } from './dto/create-midjourney.dto';
import { UpdateMidjourneyDto } from './dto/update-midjourney.dto';

@Controller('midjourney')
export class MidjourneyController {
  constructor(private readonly midjourneyService: MidjourneyService) {}

  @Post()
  create(@Body() createMidjourneyDto: CreateMidjourneyDto) {
    return this.midjourneyService.create(createMidjourneyDto);
  }

  @Get()
  findAll() {
    return this.midjourneyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.midjourneyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMidjourneyDto: UpdateMidjourneyDto) {
    return this.midjourneyService.update(+id, updateMidjourneyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.midjourneyService.remove(+id);
  }
}
