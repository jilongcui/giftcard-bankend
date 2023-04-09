import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CardinfoService } from './cardinfo.service';
import { CreateCardinfoDto, ListCardinfoDto } from './dto/create-cardinfo.dto';
import { UpdateCardinfoDto } from './dto/update-cardinfo.dto';
import { Cardinfo } from './entities/cardinfo.entity';

@ApiTags('银行卡信息')
@ApiBearerAuth()
@Controller('cardinfo')
export class CardinfoController {
  constructor(private readonly cardinfoService: CardinfoService) {}

  @Post()
  create(@Body() createCardinfoDto: CreateCardinfoDto) {
    return this.cardinfoService.create(createCardinfoDto);
  }

  /* 银行卡介绍列表 */
  @Get('list')
  // @RequiresPermissions('system:cardinfo:list')
  @ApiPaginatedResponse(Cardinfo)
  async list(@Query() listCardinfoDto: ListCardinfoDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.cardinfoService.list(listCardinfoDto, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardinfoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardinfoDto: UpdateCardinfoDto) {
    return this.cardinfoService.update(+id, updateCardinfoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardinfoService.remove(+id);
  }

}
