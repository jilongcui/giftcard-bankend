import { Controller, Get, Post, Body, Patch, Param, Delete, Query, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { AirdropService } from './airdrop.service';
import { CreateAirdropDto, ListAirdropDto, UpdateAirdropDto } from './dto/request-airdrop-activity.dto';
import { Airdrop } from './entities/airdrop-activity.entity';

@ApiTags('空投活动')
@ApiBearerAuth()
@Controller('airdrop')
export class AirdropController {
  constructor(
    private readonly airdropService: AirdropService,
  ) { }

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
