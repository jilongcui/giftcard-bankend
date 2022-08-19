import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, ListMyOrderDto, ListOrderDto, ListUnpayOrderDto, SyncInvalidOrderDto, UpdateAllOrderDto, UpdateOrderDto } from './dto/request-order.dto';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { Order } from './entities/order.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User as UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
@ApiTags('订单')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @RepeatSubmit({ interval: 60 * 5 })
  async create(@Body() createOrderDto: CreateOrderDto, @UserDec(UserEnum.userId) userId: number) {
    return await this.orderService.create(createOrderDto, userId);
  }

  @Put(':id')
  async updateAll(@Param('id') id: string, @Body() updateAllOrderDto: UpdateAllOrderDto) {
    return await this.orderService.addOrUpdateAll(updateAllOrderDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.orderService.update(+id, updateOrderDto);
  }

  /* 订单列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Order)
  async list(@Query() listOrderDto: ListOrderDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.orderService.list(listOrderDto, paginationDto);
  }

  /* 我的订单列表 */
  @Get('myList')
  @ApiPaginatedResponse(Order)
  async mylist(@Query() listMyOrderDto: ListMyOrderDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.orderService.mylist(userId, listMyOrderDto, paginationDto);
  }

  /* 未支付列表 */
  @Get('unpayList')
  @ApiPaginatedResponse(Order)
  async unpayList(@Query() listUnpayDto: ListUnpayOrderDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.orderService.myUnpayList(userId, listUnpayDto, paginationDto);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.orderService.findOne(+id);
  }

  @Delete(':id')
  async removeOne(@Param('id') id: string) {
    return await this.orderService.deleteOne(+id);
  }

  @Delete(':ids')
  async remove(@Param('ids') ids: string) {
    return await this.orderService.delete(ids.split(','));
  }

  @Post(':id/innerPay')
  async payWithBalance(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName) nickName: string) {
    return await this.orderService.payWithBalance(+id, userId, nickName);
  }

  @Post('syncInvalidOrder')
  // @RequiresPermissions('system:order:sync')
  async syncInvaldateOrder(@Body() syncInvalidOrder: SyncInvalidOrderDto) {
    return await this.orderService.syncInvalidOrder(syncInvalidOrder.activityId)
  }
}
