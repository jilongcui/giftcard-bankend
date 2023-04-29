import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Put, Query, StreamableFile, forwardRef } from '@nestjs/common';
import { OrderService } from './order.service';
import { ListMyOrderDto, ListOrderDto, ListUnpayOrderDto, RequestBankcardOrderDto, SyncInvalidOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ExcelService } from '@app/modules/common/excel/excel.service';
import { PaymentService } from '../payment/payment.service';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { Order } from './entities/order.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('支付')
@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService,
    private readonly excelService: ExcelService,
    @Inject(forwardRef(() => PaymentService)) private readonly paymentService: PaymentService
    ) {}

  @Post()
  create(@Body() createOrderDto: RequestBankcardOrderDto,
    @UserDec(UserEnum.userId) userId: number,
    @UserDec(UserEnum.nickName) nickName: string) {
    return this.orderService.createBankcardOrder(createOrderDto,  userId, nickName);
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
    return await this.orderService.cancel(+id, userId);
  }

  @Put(':id/sys/cancel')
  async syscancel(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
    return await this.orderService.cancel(+id, 0);
  }

  @Patch(':id')
  @RequiresRoles(['admin', 'system'])
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

  /* 导出订单 */
  @RepeatSubmit()
  @Post('export')
  @RequiresPermissions('monitor:order:export')
  @Keep()
  async exportOrder(@Query() listOrderDto: ListOrderDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    const { rows } = await this.orderService.list(listOrderDto, paginationDto);
    const file = await this.excelService.export(Order, rows)
    return new StreamableFile(file)
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
  @RequiresRoles(['admin', 'system'])
  async removeOne(@Param('id') id: string) {
    return await this.orderService.deleteOne(+id);
  }

  @Delete(':ids')
  @RequiresRoles(['admin', 'system'])
  async remove(@Param('ids') ids: string) {
    return await this.orderService.delete(ids.split(','));
  }

  @Post(':id/innerPay')
  async payWithBalance(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
    return await this.paymentService.payWithBalance(+id, userId);
  }

  @Post('syncInvalidOrder')
  // @RequiresPermissions('system:order:sync')
  async syncInvaldateOrder(@Body() syncInvalidOrder: SyncInvalidOrderDto) {
    return await this.orderService.syncInvalidOrder(syncInvalidOrder.activityId)
  }

}
