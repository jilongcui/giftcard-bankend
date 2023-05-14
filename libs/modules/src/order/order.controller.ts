import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, Inject, forwardRef, Logger, StreamableFile } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateLv1OrderDto, CreateLv2OrderDto, CreateOrderDto, EnrollMemberOrderDto, ListMyOrderDto, ListOrderDto, ListRechargeOrderDto, ListUnpayOrderDto, RechargeOrderDto, SyncInvalidOrderDto, UpdateAllOrderDto, UpdateOrderDto } from './dto/request-order.dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { Order } from './entities/order.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';
import { ExcelService } from '../common/excel/excel.service';
import { PaymentService } from '../payment/payment.service';
@ApiTags('订单')
@ApiBearerAuth()
@SkipThrottle()
@Controller('order')

export class OrderController {
  logger = new Logger(OrderController.name)
  constructor(
    private readonly orderService: OrderService,
    private readonly excelService: ExcelService,
    @Inject(forwardRef(() => PaymentService)) private readonly paymentService: PaymentService
  ) { }

  // @Throttle(2, 2000)
  // @Post()
  // async create(@Body() createOrderDto: CreateOrderDto, @UserDec(UserEnum.userId,) userId: number,
  //   @UserDec(UserEnum.userName, UserInfoPipe) userName: string, @UserDec(UserEnum.avatar, UserInfoPipe) avatar: string) {
  //   return await this.orderService.create(createOrderDto, userId, userName, avatar);
  // }

  @Throttle(2, 2000)
  @Post('createLv1')
  async createLv1(@Body() createOrderDto: CreateLv1OrderDto, @UserDec(UserEnum.userId) userId: number,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
    return await this.orderService.createLv1Order(createOrderDto, userId, userName);
  }

  @Throttle(2, 2000)
  @Post('createLv2')
  async createLv2(@Body() createOrderDto: CreateLv2OrderDto, @UserDec(UserEnum.userId) userId: number,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
    return await this.orderService.createLv2Order(createOrderDto, userId, userName);
  }

  @Throttle(2, 2000)
  @Post('recharge')
  async recharge(@Body() createOrderDto: RechargeOrderDto, @UserDec(UserEnum.userId) userId: number,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string, @UserDec(UserEnum.avatar, UserInfoPipe) avatar: string) {
    return await this.orderService.rechargeOrder(createOrderDto, userId, userName, avatar);
  }

  @Throttle(2, 2000)
  @Post('enroll')
  async member(@Body() createOrderDto: EnrollMemberOrderDto, @UserDec(UserEnum.userId) userId: number,
    @UserDec(UserEnum.userName, UserInfoPipe) userName: string, @UserDec(UserEnum.avatar, UserInfoPipe) avatar: string) {
    return await this.orderService.enrollMemberOrder(createOrderDto, userId, userName, avatar);
  }

  @Put(':id')
  @RequiresRoles(['admin', 'system'])
  async updateAll(@Param('id') id: string, @Body() updateAllOrderDto: UpdateAllOrderDto) {
    return await this.orderService.addOrUpdateAll(updateAllOrderDto);
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
  async exportOrder(@Body() listOrderDto: ListOrderDto, @Body(PaginationPipe) paginationDto: PaginationDto) {
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

  /* 我的订单列表 */
  @Get('rechargeList')
  @ApiPaginatedResponse(Order)
  async rechargeList(@Query() listRechargeOrderDto: ListRechargeOrderDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.orderService.myRechargeList(userId, listRechargeOrderDto, paginationDto);
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
