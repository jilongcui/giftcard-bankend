import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { AirdropWhitelistService } from './airdrop-whitelist.service';
import { CreateAirdropWhitelistDto, ListAirdropWhitelistDto, UpdateAirdropWhitelistDto } from './dto/request-airdrop-whitelist.dto';
import { AirdropWhitelist } from './entities/airdrop-whitelist.entity';

@ApiTags('空投白名单')
@ApiBearerAuth()
@Controller('airdropWhitelist')
export class AirdropWhitelistController {
  constructor(private readonly airdropService: AirdropWhitelistService) { }

  @Post()
  async create(@Body() createAirdropWhitelistDto: CreateAirdropWhitelistDto) {
    return await this.airdropService.create(createAirdropWhitelistDto);
  }

  @Get('list')
  @ApiPaginatedResponse(AirdropWhitelist)
  async list(@Query() listAirdropWhitelistDto: ListAirdropWhitelistDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.airdropService.list(listAirdropWhitelistDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.airdropService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAirdropWhitelistDto: UpdateAirdropWhitelistDto) {
    return await this.airdropService.update(+id, updateAirdropWhitelistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.airdropService.remove(+id);
  }
}
