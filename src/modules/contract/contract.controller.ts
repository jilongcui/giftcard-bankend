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
  constructor(private readonly contractService: ContractService) { }

  @Post()
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractService.create(createContractDto);
  }

  @Put(':id')
  updateAll(@Param('id') id: string, @Body() updateAllContractDto: UpdateAllContractDto) {
    return this.contractService.addOrUpdateAll(updateAllContractDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.contractService.update(+id, updateContractDto);
  }

  /* 产品列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Contract)
  async list(@Query() listContractDto: ListContractDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return DataObj.create(await this.contractService.list(listContractDto, paginationDto));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(+id);
  }

  @Delete(':id')
  removeOne(@Param('id') id: string) {
    return this.contractService.deleteOne(+id);
  }

  @Delete(':ids')
  remove(@Param('ids') ids: string) {
    return this.contractService.delete(ids.split(','));
  }
}
