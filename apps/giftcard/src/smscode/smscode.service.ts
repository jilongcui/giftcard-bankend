import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { USER_SMSCODE_KEY } from '@app/common/contants/redis.contant';
import { ApiException } from '@app/common/exceptions/api.exception';
import * as tencentcloud from "tencentcloud-sdk-nodejs"
import { ReqSmsCodeCheckDto } from './dto/req-smscode.dto';
import { HttpService } from '@nestjs/axios';
import * as moment from 'moment';
import { SharedService } from '@app/shared';
import * as qs from 'qs'; 

@Injectable()
export class SmscodeService {
    // 导入对应产品模块的client models。

    client: InstanceType<typeof tencentcloud.sms.v20210111.Client>;
    logger: Logger;
    constructor(
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly sharedService: SharedService,
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
        await this.redis.set(`${USER_SMSCODE_KEY}:${mobile}`, code, 'EX', 300)
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

    /*
    --------HTTP接口参数--------
    接口协议：参照“客户端--文档管理--HTTP文档”
    发送地址：http://8.140.188.254:18003/send.do
    UID：9218
    密码：C6C9F1C6
    提交方式：GET或POST
    分配扩展号：
    发送示例：http://8.140.188.254:18003/send.do?uid=9218&pw=C6C9F1C6&mb=17132112468&ms=【测试】你好&ex=77
    发送示例（加密）：http://8.140.188.254:18003/send.do?uid=9218&pw=faac744aa9f96e313b3ecf2320d217b6&mb=17132112468&ms=【测试】你好&ex=77&tm=20230418141954
    发送示例（定时）：http://8.140.188.254:18003/send.do?uid=9218&pw=C6C9F1C6&mb=17132112468&ms=【测试】你好&ex=77&dm=20230419141954
    点对点发送示例：http://8.140.188.254:18003/sendm.do
    {"uid":9218,"pw":"C6C9F1C6","data":[{"mb":"17132112468","ms":"【测试】你好1"},{"mb":"17132112468","ms":"【测试】你好2"}]}
    点对点发送示例（定时）：http://8.140.188.254:18003/sendm.do
    {"uid":9218,"pw":"C6C9F1C6","dm":"20230419141954","data":[{"mb":"17132112468","ms":"【测试】你好1"},{"mb":"17132112468","ms":"【测试】你好2"}]}
    */

    private async sendSmSCode(mobile: string, templatedId: string): Promise<string> {
        const code = `${this.random()}`;
        const message = encodeURI(`【原理科技】您的验证码：${code}，如非本人操作，请忽略本短信！`); 
        // const timestr = moment().format('YYYYMMDDHHmmss')
        // const body = {
        //     "mb": `${mobile}`,
        //     "uid": "9218",
        //     "pw": 'C6C9F1C6', // this.sharedService.md5('C6C9F1C6'+timestr),
        //     "ms": message,
        //     // "tm": timestr,
        //     "ex": "77"
        // };
        // const url = 'http://8.140.188.254:18003/send.do'
        let options = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;"
            },
            // body: body
        }
        // const data = qs.parse(message).encode
        // this.logger.debug(querystring.stringify(message))
        // this.logger.debug(data)
        const url = `http://8.140.188.254:18003/send.do?uid=20222&pw=E8B6F5E0&mb=${mobile}&ms=${message}&ex=77`
        this.logger.debug(url)

        let res = await this.httpService.axiosRef.get<any>(url, options);
        this.logger.debug(res.data)
        const codes = res.data.split(',')
        if(codes.length <2 ) {
            throw new ApiException("发送短信失败")
        }
        return codes[0]
    }

    private async sendSmSCode1(mobile: string, templateId: string): Promise<string> {

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
