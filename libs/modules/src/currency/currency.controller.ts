import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto, ListCurrencyDto, UpdateAllCurrencyDto, UpdateCurrencyDto, UpdateRatioDto } from './dto/request-currency.dto';
import { Currency } from './entities/currency.entity';

@ApiTags('代币')
@ApiBearerAuth()
@Controller('currency')
export class CurrencyController {
  constructor(private readonly activityService: CurrencyService) { }

  @Post()
  async create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return await this.activityService.create(createCurrencyDto);
  }

  @Put(':id')
  async updateAll(@Param('id') id: string, @Body() updateAllCurrencyDto: UpdateAllCurrencyDto) {
    return await this.activityService.addOrUpdateAll(updateAllCurrencyDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCurrencyDto: UpdateCurrencyDto) {
    return await this.activityService.update(+id, updateCurrencyDto);
  }

  @Patch(':name/updateRatio')
  async updateRatio(@Param('name') name: string, @Body() updateUsdtRatioDto: UpdateRatioDto) {
    return await this.activityService.updateRatio(name, updateUsdtRatioDto);
  }

  /* 产品列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Currency)
  async list(@Query() listCurrencyDto: ListCurrencyDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.activityService.list(listCurrencyDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.activityService.findOne(+id);
  }

  @Delete(':id')
  async removeOne(@Param('id') id: string) {
    return await this.activityService.deleteOne(+id);
  }

  @Delete(':ids')
  async remove(@Param('ids') ids: string) {
    return await this.activityService.delete(ids.split(','));
  }
}
