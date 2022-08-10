import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { AirdropService } from './airdrop-activity.service';
import { CreateAirdropDto, ListAirdropDto, UpdateAirdropDto } from './dto/request-airdrop-activity.dto';
import { Airdrop } from './entities/airdrop-activity.entity';

@ApiTags('空投活动')
@ApiBearerAuth()
@Controller('airdropAcitivty')
export class AirdropController {
  constructor(private readonly airdropAcitivtyService: AirdropService) { }

  @Post()
  async create(@Body() createAirdropDto: CreateAirdropDto) {
    return await this.airdropAcitivtyService.create(createAirdropDto);
  }

  @Get('list')
  @ApiPaginatedResponse(Airdrop)
  async list(@Query() listAirdropDto: ListAirdropDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.airdropAcitivtyService.list(listAirdropDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.airdropAcitivtyService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAirdropDto: UpdateAirdropDto) {
    return await this.airdropAcitivtyService.update(+id, updateAirdropDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.airdropAcitivtyService.remove(+id);
  }
}
