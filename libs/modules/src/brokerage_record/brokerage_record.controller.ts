import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BrokerageRecordService } from './brokerage_record.service';
import { GetTotalBrokerageDto, ListMyBrokerageRecordDto, ListBrokerageRecordDto } from './dto/create-brokerage_record.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { Order } from '../order/entities/order.entity';
import { BrokerageRecord } from './entities/brokerage_record.entity';

@ApiTags("用户佣金报表")
@ApiBearerAuth()
@Controller('brokerage-record')
export class BrokerageRecordController {
  constructor(private readonly profitRecordService: BrokerageRecordService) {}

  // @Post()
  // create(@Body() createProfitRecordDto: CreateProfitRecordDto) {
  //   return this.profitRecordService.create(createProfitRecordDto);
  // }

  /* 获取总订单 */
  @Get('total')
  @Public()
  @ApiPaginatedResponse(BrokerageRecord)
  async total(@Query() getTotalProfitDto: GetTotalBrokerageDto) {
    return await this.profitRecordService.total(getTotalProfitDto);
  }

  /* 订单列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(BrokerageRecord)
  async list(@Query() listOrderDto: ListBrokerageRecordDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.profitRecordService.list(listOrderDto, paginationDto);
  }

  /* 我的订单列表 */
  @Get('myList')
  @ApiPaginatedResponse(BrokerageRecord)
  async mylist(@Query() listMyOrderDto: ListMyBrokerageRecordDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.profitRecordService.mylist(userId, listMyOrderDto, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profitRecordService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProfitRecordDto: UpdateProfitRecordDto) {
  //   return this.profitRecordService.update(+id, updateProfitRecordDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.profitRecordService.remove(+id);
  // }
}
