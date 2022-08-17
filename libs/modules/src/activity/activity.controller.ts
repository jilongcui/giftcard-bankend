import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
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

  @Put(':id/start')
  async start(@Param('id') id: string) {
    return await this.activityService.start(+id);
  }

  @Put(':id/sellout')
  async sellout(@Param('id') id: string) {
    return await this.activityService.sellout(+id);
  }

  @Put(':id/finish')
  async finish(@Param('id') id: string) {
    return await this.activityService.finish(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return await this.activityService.update(+id, updateActivityDto);
  }

  @Get('top')
  @Public()
  @ApiPaginatedResponse(Activity)
  async top() {
    return await this.activityService.topList();
  }

  /* 产品列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Activity)
  async list(@Query() listActivityDto: ListActivityDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.activityService.list(listActivityDto, paginationDto);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.activityService.findOne(+id);
  }

  @Get(':id/count')
  @Public()
  async getCount(@Param('id') id: string) {
    return await this.activityService.getRemainCount(id);
  }

  @Delete(':id')
  async removeOne(@Param('id') id: string) {
    return await this.activityService.deleteOne(+id);
  }

  @Delete(':ids')
  async remove(@Param('ids') ids: string) {
    return await this.activityService.delete(ids.split(','));
  }

  @Put(':id/collection/:collectionId')
  async addCollection(@Param('id') id: string, @Param('collectionId') collectionId: string) {
    return await this.activityService.addCollection(+id, +collectionId);
  }

  @Delete(':id/collection/:collectionId')
  async removeCollection(@Param('id') id: string, @Param('collectionId') collectionId: string) {
    return await this.activityService.deleteCollection(+id, +collectionId);
  }
}
