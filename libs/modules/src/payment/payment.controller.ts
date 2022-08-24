import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ConfirmPayWithCardDto, CreatePaymentDto, PayWithBalanceDto, PayWithCardDto, UpdatePaymentDto, WebSignDto } from './dto/request-payment.dto';
import { User as UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { SharedService } from '@app/shared';
import { Request, Response } from 'express'
import { BalancePayService } from './balance-pay.service';
import { Keep } from '@app/common/decorators/keep.decorator';

@ApiTags('支付')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly balancePayService: BalancePayService,
    private readonly sharedService: SharedService,
  ) { }

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

  @Post('webSign')
  webSign(@Body() webSignDto: WebSignDto, @UserDec(UserEnum.userId) userId: number,) {

    return this.paymentService.webSign(webSignDto, userId)
  }

  @Post('balancePay')
  async payWithBalance(@Body() payWithBalance: PayWithBalanceDto, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName) nickName: string) {
    return await this.balancePayService.payWithBalance(payWithBalance.orderId, userId, nickName);
  }

  @Post('cardPay')
  payWithCard(@Body() payWithCard: PayWithCardDto, @UserDec(UserEnum.userId) userId: number, @Req() request: Request) {
    const ipaddr = this.sharedService.getReqIP(request)
    return this.paymentService.sendPaySMS(payWithCard, userId, ipaddr)
  }

  @Post('confirmCardPay')
  confirmPayWithCard(@Body() confirmPayDto: ConfirmPayWithCardDto, @UserDec(UserEnum.userId) userId: number, userIp) {

    return this.paymentService.confirmPayment(confirmPayDto, userId)
  }

  @Post('webSignNotify')
  @Keep()
  @Public()
  webSignNotify(@Body() webSignNotifyDto: any) {
    return this.paymentService.webSignNotify(webSignNotifyDto)
  }

  @Post('paymentNotify')
  @Keep()
  @Public()
  async paymentNotify(@Body() cryptNotifyDto: any,) {
    return await this.paymentService.paymentNotify(cryptNotifyDto)
  }
}
