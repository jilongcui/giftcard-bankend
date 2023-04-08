import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScreenshotService } from './screenshot.service';
import { CreateScreenshotDto, SetCreateScreenshotDto } from './dto/create-screenshot.dto';
import { UpdateScreenshotDto } from './dto/update-screenshot.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags("截屏")
@ApiBearerAuth()
@Controller('screenshot')
export class ScreenshotController {
  constructor(private readonly screenshotService: ScreenshotService) {}

  @Post()
  create(@Body() createScreenshotDto: CreateScreenshotDto) {
    return this.screenshotService.create(createScreenshotDto);
  }

  @Post('set')
  setCreate(@Body() createScreenshotDto: SetCreateScreenshotDto) {
    return this.screenshotService.setCreate(createScreenshotDto);
  }

  @Get()
  findAll() {
    return this.screenshotService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.screenshotService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScreenshotDto: UpdateScreenshotDto) {
    return this.screenshotService.update(+id, updateScreenshotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.screenshotService.remove(+id);
  }
}
