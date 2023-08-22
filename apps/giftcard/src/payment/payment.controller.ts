import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, Query, Logger, Header, Render, All } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PayWithBalanceDto, ReqWeixinPaymentNotifyDto, WeixinPayForMemberDto } from './dto/request-payment.dto';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { SharedService } from '@app/shared';
import { Request, Response } from 'express'
import { Keep } from '@app/common/decorators/keep.decorator';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';

@ApiTags('支付')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  logger: Logger
  constructor(
    private readonly paymentService: PaymentService,
    private readonly sharedService: SharedService,
  ) {
    this.logger = new Logger(PaymentController.name)
  }

  // @Post()
  // create(@Body() createPaymentDto: CreatePaymentDto) {
  //   return this.paymentService.create(createPaymentDto);
  // }

  // @Get()
  // findAll() {
  //   return this.paymentService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.paymentService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
  //   return this.paymentService.update(+id, updatePaymentDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.paymentService.remove(+id);
  // }

  @Get()
  index(@Res() response: Response) {
    response.set({ 'Content-Type': 'text/plain; charset=utf-8' });

    response.send(`The request IP is:"`);
  }

  @Post('balancePay')
  async payWithBalance(@Body() payWithBalance: PayWithBalanceDto, @UserDec(UserEnum.userId) userId: number) {
    return await this.paymentService.payWithBalance(payWithBalance.orderId, userId);
  }
}
