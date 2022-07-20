import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DataObj } from 'src/common/class/data-obj.class';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { ContractService } from './contract.service';
import { CreateContractDto, ListContractDto, UpdateAllContractDto, UpdateContractDto } from './dto/request-contract.dto';
import { Contract } from './entities/contract.entity';
@ApiTags('链上合约')
@ApiBearerAuth()
@Controller('contract')
export class ContractController {
  constructor(private readonly activityService: ContractService) { }

  @Post()
  create(@Body() createContractDto: CreateContractDto) {
    return this.activityService.create(createContractDto);
  }

  @Put(':id')
  updateAll(@Param('id') id: string, @Body() updateAllContractDto: UpdateAllContractDto) {
    return this.activityService.addOrUpdateAll(updateAllContractDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.activityService.update(+id, updateContractDto);
  }

  /* 产品列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Contract)
  async list(@Query() listContractDto: ListContractDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return DataObj.create(await this.activityService.list(listContractDto, paginationDto));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id);
  }

  @Delete(':id')
  removeOne(@Param('id') id: string) {
    return this.activityService.deleteOne(+id);
  }

  @Delete(':ids')
  remove(@Param('ids') ids: string) {
    return this.activityService.delete(ids.split(','));
  }
}
