import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, Query, Logger, Header, Render, All } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ConfirmPayWithCardDto, CreatePaymentDto, PayWithBalanceDto, PayWithCardDto, ReqCryptoNotifyDto, UpdatePaymentDto, WebSignDto, WeixinPayForMemberDto } from './dto/request-payment.dto';
import { User as UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { SharedService } from '@app/shared';
import { Request, Response } from 'express'
import { Keep } from '@app/common/decorators/keep.decorator';
import { Accepts } from '@app/common/guards/accepts.decorator';
import { PostService } from '../system/post/post.service';
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

  @Post('webSign')
  webSign(@Body() webSignDto: WebSignDto, @UserDec(UserEnum.userId) userId: number,) {

    return this.paymentService.webSign(webSignDto, userId)
  }

  @Post('weixinPay')
  async weixinPay(@Body() payForMember: WeixinPayForMemberDto, @UserDec(UserEnum.userId) userId: number,
    @UserDec(UserEnum.openId) openId: string, @Req() request: Request) {
    const ipaddr = this.sharedService.getReqIP(request)
    return await this.paymentService.payWithWeixin(payForMember, userId, openId, ipaddr);
  }

  @Post('balancePay')
  async payWithBalance(@Body() payWithBalance: PayWithBalanceDto, @UserDec(UserEnum.userId) userId: number) {
    return await this.paymentService.payWithBalance(payWithBalance.orderId, userId);
  }

  @Post('cardPay')
  payWithCard(@Body() payWithCard: PayWithCardDto, @UserDec(UserEnum.userId) userId: number, @Req() request: Request) {
    const ipaddr = this.sharedService.getReqIP(request)
    return this.paymentService.sendPaySMS(payWithCard, userId, ipaddr)
  }

  @Post('confirmCardPay')
  confirmPayWithCard(@Body() confirmPayDto: ConfirmPayWithCardDto, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.userName, UserInfoPipe) userName: string, userIp) {
    return this.paymentService.confirmPayment(confirmPayDto, userId, userName)
  }

  @Post('webSignNotify')
  // @Keep()
  @Public()
  webSignNotify(@Body() webSignNotifyDto: any) {
    return this.paymentService.webSignNotify(webSignNotifyDto)
  }

  @Get('notify')
  @Keep()
  @Public()
  @Header('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
  // @Header('Content-Type', 'application/json; charset=utf-8')
  // @Accepts('application/x-www-form-urlencoded', 'application/json', 'text/html')
  async notify(@Req() request: Request, @Res() response: Response) {
    let cryptNotifyDto: ReqCryptoNotifyDto
    // this.logger.debug(JSON.stringify(request.body))
    // this.logger.debug(JSON.stringify(request.params))
    // this.logger.debug(JSON.stringify(request.headers))
    // this.logger.debug(JSON.stringify(request.query))

    this.logger.debug(JSON.stringify(cryptNotifyDto))

    cryptNotifyDto = request.query
    this.logger.debug(cryptNotifyDto.agent_id)
    this.logger.debug(cryptNotifyDto.encrypt_data)
    this.logger.debug(cryptNotifyDto.sign)
    response.end(await this.paymentService.paymentNotify(cryptNotifyDto))
  }
}
