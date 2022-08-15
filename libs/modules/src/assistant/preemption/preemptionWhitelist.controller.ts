import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PreemptionWhiteListService } from './preemptionWhitelist.service';
import { CreatePreemptionWhitelistDto, ListPreemptionWhitelistDto, UpdatePreemptionWhitelistDto } from './dto/request-preemption-whitelist.dto';
import { PreemptionWhitelist } from './entities/preemptionWhitelist.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('优先购白名单')
@ApiBearerAuth()
@Controller('preemptionWhitlist')
export class PreemptionWhiteController {
  constructor(private readonly preemptionWhitelistService: PreemptionWhiteListService) { }

  @Post()
  async create(@Body() createPreemptionWhitelistDto: CreatePreemptionWhitelistDto) {
    return await this.preemptionWhitelistService.create(createPreemptionWhitelistDto);
  }

  @Get('list')
  @ApiPaginatedResponse(PreemptionWhitelist)
  async list(@Query() listPreemptionWhitelistDto: ListPreemptionWhitelistDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.preemptionWhitelistService.list(listPreemptionWhitelistDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.preemptionWhitelistService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePreemptionWhitelistDto: UpdatePreemptionWhitelistDto) {
    return await this.preemptionWhitelistService.update(+id, updatePreemptionWhitelistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preemptionWhitelistService.remove(+id);
  }
}
