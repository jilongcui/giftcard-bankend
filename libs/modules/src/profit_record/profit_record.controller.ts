import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProfitRecordService } from './profit_record.service';
import { CreateProfitRecordDto, GetTotalProfitDto, ListMyProfitRecordDto, ListProfitRecordDto } from './dto/create-profit_record.dto';
import { UpdateProfitRecordDto } from './dto/update-profit_record.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ProfitRecord } from './entities/profit_record.entity';

@ApiTags("系统收益报表")
@ApiBearerAuth()
@Controller('profit-record')
export class ProfitRecordController {
  constructor(private readonly profitRecordService: ProfitRecordService) {}

  // @Post()
  // create(@Body() createProfitRecordDto: CreateProfitRecordDto) {
  //   return this.profitRecordService.create(createProfitRecordDto);
  // }

  /* 获取总收益 */
  @Get('total')
  @Public()
  async total(@Query() getTotalProfitDto: GetTotalProfitDto) {
    return await this.profitRecordService.total(getTotalProfitDto);
  }

  /* 收益列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(ProfitRecord)
  async list(@Query() listOrderDto: ListProfitRecordDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.profitRecordService.list(listOrderDto, paginationDto);
  }

  /* 我的收益列表 */
  @Get('mylist')
  @ApiPaginatedResponse(ProfitRecord)
  async mylist(@Query() listMyOrderDto: ListMyProfitRecordDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.profitRecordService.mylist(userId, listMyOrderDto, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profitRecordService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProfitRecordDto: UpdateProfitRecordDto) {
    return this.profitRecordService.update(+id, updateProfitRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profitRecordService.remove(+id);
  }
}
