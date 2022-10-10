import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ActivityService } from './activity.service';
import { CreateActivityDto, ListActivityDto, UpdateActivityDto, UpdateAllActivityDto } from './dto/request-activity.dto';
import { Activity } from './entities/activity.entity';
import { ThrottlerBehindProxyGuard } from '@app/common/guards/throttler-behind-proxy.guard';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';

@ApiTags('活动')
@ApiBearerAuth()
@UseGuards(ThrottlerBehindProxyGuard)
@Controller('activity')
export class ActivityController {
  logger = new Logger(Activity.name)
  constructor(private readonly activityService: ActivityService) { }

  @Post()
  @RequiresRoles(['admin', 'system'])
  async create(@Body() createActivityDto: CreateActivityDto) {
    return await this.activityService.create(createActivityDto);
  }

  @Put(':id')
  @RequiresRoles(['admin', 'system'])
  async updateAll(@Param('id') id: string, @Body() updateAllActivityDto: UpdateAllActivityDto) {
    return await this.activityService.addOrUpdateAll(updateAllActivityDto);
  }

  @Put(':id/start')
  @RequiresRoles(['admin', 'system'])
  async start(@Param('id') id: string) {
    return await this.activityService.start(+id);
  }

  @Put(':id/sellout')
  @RequiresRoles(['admin', 'system'])
  async sellout(@Param('id') id: string) {
    return await this.activityService.sellout(+id);
  }

  @Put(':id/finish')
  @RequiresRoles(['admin', 'system'])
  async finish(@Param('id') id: string) {
    return await this.activityService.finish(+id);
  }

  @Put(':id/top')
  @RequiresRoles(['admin', 'system'])
  async setTop(@Param('id') id: string) {
    return await this.activityService.setTop(+id);
  }

  @Put(':id/untop')
  @RequiresRoles(['admin', 'system'])
  async unTop(@Param('id') id: string) {
    return await this.activityService.unTop(+id);
  }

  @Put(':id/openMarket')
  @RequiresRoles(['admin', 'system'])
  async openMarket(@Param('id') id: string) {
    return await this.activityService.openMarket(+id);
  }

  @Put(':id/closeMarket')
  @RequiresRoles(['admin', 'system'])
  async closeMarket(@Param('id') id: string) {
    return await this.activityService.closeMarket(+id);
  }

  @Patch(':id')
  @RequiresRoles(['admin', 'system'])
  async update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return await this.activityService.update(+id, updateActivityDto);
  }

  @Get('top')
  @Public()
  @ApiPaginatedResponse(Activity)
  async top() {
    return await this.activityService.topList();
  }

  /* 更多活动列表 */
  @Get('more')
  @Public()
  @ApiPaginatedResponse(Activity)
  async more(@Query() listActivityDto: ListActivityDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.activityService.more(listActivityDto, paginationDto);
  }

  /* 活动列表 */
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
  @RequiresRoles(['admin', 'system'])
  async removeOne(@Param('id') id: string) {
    return await this.activityService.deleteOne(+id);
  }

  @Delete(':ids')
  @RequiresRoles(['admin', 'system'])
  async remove(@Param('ids') ids: string) {
    return await this.activityService.delete(ids.split(','));
  }

  @Put(':id/collection/:collectionId')
  @RequiresRoles(['admin', 'system'])
  async addCollection(@Param('id') id: string, @Param('collectionId') collectionId: string) {
    return await this.activityService.addCollection(+id, +collectionId);
  }

  @Delete(':id/collection/:collectionId')
  @RequiresRoles(['admin', 'system'])
  async removeCollection(@Param('id') id: string, @Param('collectionId') collectionId: string) {
    return await this.activityService.deleteCollection(+id, +collectionId);
  }
}
