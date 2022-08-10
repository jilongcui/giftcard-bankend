import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { PreemptionActivityService } from './preemption-activity.service';
import { CreatePreemptionActivityDto, ListPreemptionActivityDto, UpdatePreemptionActivityDto } from './dto/request-preemption-activity.dto';
import { PreemptionActivity } from './entities/preemption-activity.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('优先购活动')
@ApiBearerAuth()
@Controller('preemptionAcitivty')
export class PreemptionActivityController {
  constructor(private readonly preemptionAcitivtyService: PreemptionActivityService) { }

  @Post()
  async create(@Body() createPreemptionActivityDto: CreatePreemptionActivityDto) {
    return await this.preemptionAcitivtyService.create(createPreemptionActivityDto);
  }

  @Get('list')
  @ApiPaginatedResponse(PreemptionActivity)
  async list(@Query() listPreemptionActivityDto: ListPreemptionActivityDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.preemptionAcitivtyService.list(listPreemptionActivityDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.preemptionAcitivtyService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePreemptionActivityDto: UpdatePreemptionActivityDto) {
    return await this.preemptionAcitivtyService.update(+id, updatePreemptionActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preemptionAcitivtyService.remove(+id);
  }
}
