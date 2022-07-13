import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { USER_SMSCODE_KEY } from 'src/common/contants/redis.contant';
import { ApiException } from 'src/common/exceptions/api.exception';
import * as tencentcloud from "tencentcloud-sdk-nodejs"
import { ReqSmsCodeCheckDto } from './dto/req-smscode.dto';

@Injectable()
export class SmscodeService {
    // 导入对应产品模块的client models。

    client: InstanceType<typeof tencentcloud.sms.v20210111.Client>;
    logger: Logger;
    constructor(
        private readonly configService: ConfigService,
        @InjectRedis() private readonly redis: Redis,
    ) {
        this.logger = new Logger(SmscodeService.name);
        const secretId = this.configService.get<string>('tencentSMS.SecretId')
        const secretKey = this.configService.get<string>('tencentSMS.SecretKey')
        this.client = new tencentcloud.sms.v20210111.Client({
            credential: {
                secretId: secretId,
                secretKey: secretKey,
            },
            region: "ap-nanjing",
            // profile: {
            //     signMethod: "TC3-HMAC-SHA256",
            //     httpProfile: {
            //         reqMethod: "POST",
            //         reqTimeout: 30,
            //         endpoint: "sms.tencentcloudapi.com",
            //     },
            // },
        })
    }

    async sendRegCode(mobile: string) {
        const templateId = this.configService.get<string>('tencentSMS.TemplateRegId')
        const code = await this.sendSmSCode(mobile, templateId);
        await this.redis.set(`${USER_SMSCODE_KEY}:${mobile}`, code, 'EX', 30)
    }

    async sendLoginCode(mobile: string) {
        const templateId = this.configService.get<string>('tencentSMS.TemplateLoginId')
        const code = await this.sendSmSCode(mobile, templateId);
        await this.redis.set(`${USER_SMSCODE_KEY}:${mobile}`, code, 'EX', 300)
    }

    async checkSmsCode(reqSmsCodeCheckDto: ReqSmsCodeCheckDto) {
        const cacheCode = await this.redis.get(`${USER_SMSCODE_KEY}:${reqSmsCodeCheckDto.phone}`)
        if (!cacheCode) throw new ApiException("短信验证码已过期")
        if (reqSmsCodeCheckDto.code != cacheCode) throw new ApiException("短信验证码错误")
    }
    async checkAndDeleteSmsCode(reqSmsCodeCheckDto: ReqSmsCodeCheckDto) {
        this.checkSmsCode(reqSmsCodeCheckDto)
        await this.redis.del(`${USER_SMSCODE_KEY}:${reqSmsCodeCheckDto.phone}`)
    }

    private async sendSmSCode(mobile: string, templateId: string): Promise<string> {

        const code = `${this.random()}`;
        const smsSdkAppId = this.configService.get<string>('tencentSMS.SmsSdkAppId')
        const signName = this.configService.get<string>('tencentSMS.SignName')
        const smsParams = {
            "PhoneNumberSet": [
                `+86${mobile}`
            ],
            "SmsSdkAppId": smsSdkAppId,
            "TemplateId": templateId,
            "SignName": signName,
            "TemplateParamSet": [code]
        };

        try {
            const result = await this.client.SendSms(smsParams);
            if (result?.SendStatusSet[0].Code === 'Ok') {
                return code;
            } else {
                throw new ApiException(result?.SendStatusSet[0].Message)
            }
        } catch (err) {
            throw new ApiException(err)
        }
    }
    private random(): number {
        return Math.floor((Math.random() * 9999) + 1000);
    }
}
