import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { RepeatSubmit } from 'src/common/decorators/repeat-submit.decorator';
import { ImageCaptchaGuard } from 'src/common/guards/image-captcha.guard';
import { ReqSmsCodeCheckDto, ReqSmsCodeSendDto } from './dto/req-smscode.dto';
import { SmscodeService } from './smscode.service';

@ApiTags("短信验证码")
@ApiBearerAuth()
@Controller('smscode')
export class SmscodeController {
    constructor(
        private readonly smscodeService: SmscodeService,
    ) {

    }

    @RepeatSubmit()
    @Public()
    @UseGuards(ImageCaptchaGuard)
    @Post("reg")
    async sendRegCode(@Body() reqSmscodeSendDto: ReqSmsCodeSendDto): Promise<any> {
        return this.smscodeService.sendRegCode(reqSmscodeSendDto.phone);
    }

    @RepeatSubmit()
    @Public()
    @UseGuards(ImageCaptchaGuard)
    @Post("login")
    async sendLoginCode(@Body() reqSmscodeSendDto: ReqSmsCodeSendDto): Promise<any> {
        return this.smscodeService.sendLoginCode(reqSmscodeSendDto.phone);
    }

    @Post("checkcode")
    @Public()
    async checkSmsCode(@Body() reqSmscodCheckDto: ReqSmsCodeCheckDto): Promise<any> {
        return this.smscodeService.checkSmsCode(reqSmscodCheckDto);
    }
}
