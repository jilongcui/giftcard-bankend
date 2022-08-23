import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto, UpdatePaymentDto, WebSignDto } from './dto/request-payment.dto';
import { User as UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';

@ApiTags('支付')
@ApiBearerAuth()
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }

  @Post('webSign')
  webSign(@Body() webSignDto: WebSignDto, @UserDec(UserEnum.userId) userId: number,) {

    return this.paymentService.webSign(webSignDto, userId)
  }

  @Post('webSignNotify')
  @Public()
  webSignNotify(@Body() webSignDto: any) {
    return this.paymentService.webSignNotify(webSignDto)
  }
}
