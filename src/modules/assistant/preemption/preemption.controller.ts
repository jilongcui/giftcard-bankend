import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { PreemptionService } from './preemption.service';
import { CreatePreemptionDto, ListPreemptionDto, UpdatePreemptionDto } from './dto/request-preemption.dto';
import { Preemption } from './entities/preemption.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('优先购活动')
@ApiBearerAuth()
@Controller('preemption')
export class PreemptionController {
  constructor(private readonly preemptionAcitivtyService: PreemptionService) { }

  @Post()
  async create(@Body() createPreemptionDto: CreatePreemptionDto) {
    return await this.preemptionAcitivtyService.create(createPreemptionDto);
  }

  @Get('list')
  @ApiPaginatedResponse(Preemption)
  async list(@Query() listPreemptionDto: ListPreemptionDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.preemptionAcitivtyService.list(listPreemptionDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.preemptionAcitivtyService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePreemptionDto: UpdatePreemptionDto) {
    return await this.preemptionAcitivtyService.update(+id, updatePreemptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preemptionAcitivtyService.remove(+id);
  }
}
