import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { AirdropService } from './airdrop.service';
import { CreateAirdropDto, ListAirdropDto, UpdateAirdropDto } from './dto/request-airdrop.dto';
import { Airdrop } from './entities/airdrop.entity';

@ApiTags('空投')
@ApiBearerAuth()
@Controller('airdrop')
export class AirdropController {
  constructor(private readonly airdropService: AirdropService) { }

  @Post()
  async create(@Body() createAirdropDto: CreateAirdropDto) {
    return await this.airdropService.create(createAirdropDto);
  }

  @Get('list')
  @ApiPaginatedResponse(Airdrop)
  async list(@Query() listAirdropDto: ListAirdropDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.airdropService.list(listAirdropDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.airdropService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAirdropDto: UpdateAirdropDto) {
    return await this.airdropService.update(+id, updateAirdropDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.airdropService.remove(+id);
  }
}
