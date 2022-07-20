import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DataObj } from 'src/common/class/data-obj.class';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { ActivityService } from './activity.service';
import { CreateActivityDto, ListActivityDto, UpdateActivityDto, UpdateAllActivityDto } from './dto/request-activity.dto';
import { Activity } from './entities/activity.entity';

@ApiTags('活动')
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }

  @Post()
  async create(@Body() createActivityDto: CreateActivityDto) {
    return await this.activityService.create(createActivityDto);
  }

  @Put(':id')
  async updateAll(@Param('id') id: string, @Body() updateAllActivityDto: UpdateAllActivityDto) {
    return await this.activityService.addOrUpdateAll(updateAllActivityDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return await this.activityService.update(+id, updateActivityDto);
  }

  /* 产品列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Activity)
  async list(@Query() listActivityDto: ListActivityDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return DataObj.create(await this.activityService.list(listActivityDto, paginationDto));
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
