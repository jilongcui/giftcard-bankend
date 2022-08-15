import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { BannerService } from './banner.service';
import { CreateBannerDto, ListBannerDto, UpdateBannerDto } from './dto/request-banner.dto';
import { Banner } from './entities/banner.entity';

@ApiTags('Banner')
@ApiBearerAuth()
@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) { }

  @Post()
  async create(@Body() createBannerDto: CreateBannerDto) {
    return await this.bannerService.create(createBannerDto);
  }

  @Get()
  @Public()
  @ApiPaginatedResponse(Banner)
  async list(@Query() listBannerDto: ListBannerDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.bannerService.list(listBannerDto, paginationDto);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.bannerService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return await this.bannerService.update(+id, updateBannerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.bannerService.remove(+id);
  }
}
