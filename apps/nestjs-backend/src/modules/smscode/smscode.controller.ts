import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { ApiException } from '@app/common/exceptions/api.exception';
import { ImageCaptchaGuard } from '@app/common/guards/image-captcha.guard';
import { SharedService } from 'src/shared/shared.service';
import { ReqSmsCodeCheckDto, ReqSmsCodeSendDto } from './dto/req-smscode.dto';
import { SmscodeService } from './smscode.service';

@ApiTags("短信验证码")
@ApiBearerAuth()
@Controller('smscode')
export class SmscodeController {
    constructor(
        private readonly smscodeService: SmscodeService,
        private readonly sharedService: SharedService,
    ) {

    }

    @RepeatSubmit()
    @Public()
    // @UseGuards(ImageCaptchaGuard)
    @Post("reg")
    async sendRegCode(@Body() reqSmscodeSendDto: ReqSmsCodeSendDto): Promise<any> {
        if (!await this.sharedService.checkImageCaptcha(reqSmscodeSendDto.uuid, reqSmscodeSendDto.code))
            throw new ApiException('图形验证码错误')
        return this.smscodeService.sendRegCode(reqSmscodeSendDto.phone);
    }

    @RepeatSubmit()
    @Public()
    // @UseGuards(ImageCaptchaGuard)
    @Post("login")
    async sendLoginCode(@Body() reqSmscodeSendDto: ReqSmsCodeSendDto): Promise<any> {
        if (!await this.sharedService.checkImageCaptcha(reqSmscodeSendDto.uuid, reqSmscodeSendDto.code))
            throw new ApiException('图形验证码错误')
        return this.smscodeService.sendLoginCode(reqSmscodeSendDto.phone);
    }

    @Post("checkcode")
    @Public()
    async checkSmsCode(@Body() reqSmscodCheckDto: ReqSmsCodeCheckDto): Promise<any> {
        return this.smscodeService.checkSmsCode(reqSmscodCheckDto);
    }
}

