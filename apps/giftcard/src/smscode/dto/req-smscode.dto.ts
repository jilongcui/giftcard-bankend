import { IsString } from "class-validator";

export class ReqSmsCodeSendDto {
    /* 手机号 */
    @IsString()
    phone: string

    /* imagecha uuid */
    @IsString()
    uuid: string

    /* imagecha code */
    @IsString()
    code: string
}

export class ReqSmsCodeCheckDto {
    /* 手机号 */
    @IsString()
    phone: string

    /* 手机号 */
    @IsString()
    code: string
}