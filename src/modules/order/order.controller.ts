import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, ListOrderDto, UpdateAllOrderDto, UpdateOrderDto } from './dto/request-order.dto';
import { DataObj } from 'src/common/class/data-obj.class';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { Order } from './entities/order.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('订单')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private readonly activityService: OrderService) { }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.activityService.create(createOrderDto);
  }

  @Put(':id')
  async updateAll(@Param('id') id: string, @Body() updateAllOrderDto: UpdateAllOrderDto) {
    return await this.activityService.addOrUpdateAll(updateAllOrderDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.activityService.update(+id, updateOrderDto);
  }

  /* 产品列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Order)
  async list(@Query() listOrderDto: ListOrderDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.activityService.list(listOrderDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.activityService.findOne(+id);
  }

  @Delete(':id')
  async removeOne(@Param('id') id: string) {
    return await this.activityService.deleteOne(+id);
  }

  @Delete(':ids')
  async remove(@Param('ids') ids: string) {
    return await this.activityService.delete(ids.split(','));
  }
}
