import { Keep } from '@app/common/decorators/keep.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ReqCryptoNotifyDto } from '@app/modules/payment/dto/request-payment.dto';
import { PaymentService } from '@app/modules/payment/payment.service';
import { Controller, Get, Header, Logger, Req, Res, } from '@nestjs/common';
import { Request, Response } from 'express'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

// @Controller('notify')
// export class NotifyController {
//     @Get()
//     getHello(): string {
//         return 'hello world';
//     }
// }
@ApiTags('支付通知')
@ApiBearerAuth()
@Controller('payment/notify')
export class NotifyController {
    logger: Logger
    constructor(
        private readonly paymentService: PaymentService,
    ) {
        this.logger = new Logger(NotifyController.name)
    }

    @Get()
    @Public()
    @Keep()
    async notify(@Req() request: Request, @Res() response: Response) {
        let cryptNotifyDto: ReqCryptoNotifyDto
        this.logger.debug(JSON.stringify(request.url))
        // this.logger.debug(JSON.stringify(request.body))
        // this.logger.debug(JSON.stringify(request.params))
        // this.logger.debug(JSON.stringify(request.headers))
        // this.logger.debug(JSON.stringify(request.query))
        cryptNotifyDto = request.query
        this.logger.debug(JSON.stringify(cryptNotifyDto))
        // this.logger.debug(cryptNotifyDto.agent_id)
        // this.logger.debug(cryptNotifyDto.encrypt_data)
        // this.logger.debug(cryptNotifyDto.sign)
        response.end(await this.paymentService.paymentNotify(cryptNotifyDto))
    }
}

