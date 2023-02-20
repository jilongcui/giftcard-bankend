import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { AppmodelService } from './appmodel.service';
import { CreateAppmodelDto, ListAppmodelDto, UpdateAppmodelDto } from './dto/request-appmodel.dto';
import { Appmodel } from './entities/appmodel.entity';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';

@ApiTags('Appmodel')
@ApiBearerAuth()
@Controller('appmodel')
export class AppmodelController {
  constructor(private readonly appmodelService: AppmodelService) { }

  @Post()
  @RequiresRoles(['admin', 'system'])
  async create(@Body() createAppmodelDto: CreateAppmodelDto) {
    return await this.appmodelService.create(createAppmodelDto);
  }

  @Get()
  @Public()
  @ApiPaginatedResponse(Appmodel)
  async list(@Query() listAppmodelDto: ListAppmodelDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.appmodelService.list(listAppmodelDto, paginationDto);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.appmodelService.findOne(+id);
  }

  @Patch(':id')
  @RequiresRoles(['admin', 'system'])
  async update(@Param('id') id: string, @Body() updateAppmodelDto: UpdateAppmodelDto) {
    return await this.appmodelService.update(+id, updateAppmodelDto);
  }

  @Delete(':id')
  @RequiresRoles(['admin', 'system'])
  async remove(@Param('id') id: string) {
    return await this.appmodelService.remove(+id);
  }
}
