import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { AirdropActivityService } from './airdrop-activity.service';
import { CreateAirdropActivityDto, ListAirdropActivityDto, UpdateAirdropActivityDto } from './dto/request-airdrop-activity.dto';
import { AirdropActivity } from './entities/airdrop-activity.entity';

@Controller('airdropAcitivty')
export class AirdropActivityController {
  constructor(private readonly airdropAcitivtyService: AirdropActivityService) { }

  @Post()
  async create(@Body() createAirdropActivityDto: CreateAirdropActivityDto) {
    return await this.airdropAcitivtyService.create(createAirdropActivityDto);
  }

  @Get('list')
  @ApiPaginatedResponse(AirdropActivity)
  async list(@Query() listAirdropActivityDto: ListAirdropActivityDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.airdropAcitivtyService.list(listAirdropActivityDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.airdropAcitivtyService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAirdropActivityDto: UpdateAirdropActivityDto) {
    return await this.airdropAcitivtyService.update(+id, updateAirdropActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.airdropAcitivtyService.remove(+id);
  }
}
