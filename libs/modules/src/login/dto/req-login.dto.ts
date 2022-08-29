import { IsOptional, IsString } from "class-validator"

export class ReqLoginDto {
    /* uuid码 */
    @IsString()
    uuid: string

    /* 验证码code */
    @IsString()
    code: string

    /* 用户名 */
    @IsString()
    username: string

    /* 密码 */
    @IsString()
    password: string
}

export class ReqMobileLoginDto {

    /* 手机号 */
    @IsString()
    phone: string

    /* 验证码code */
    @IsString()
    code: string

}

export class ReqMobileRegDto {
    /* 用户名 */
    @IsString()
    phone: string

    /* 验证码code */
    @IsString()
    code: string

    @IsOptional()
    @IsString()
    invite?: string
}

export class QueryInviteUserDto {
    /* 邀请码 */
    @IsOptional()
    @IsString()
    invite?: string
}