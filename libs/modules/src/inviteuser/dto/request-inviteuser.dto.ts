import { ParamsDto } from "@app/common/dto/params.dto"
import { Type } from "class-transformer"
import { IsOptional, IsString, IsNumber, IsObject, IsBoolean } from "class-validator"

/* 分页查询用户 */
export class ReqInviteUserListDto {
    @IsOptional()
    @IsString()
    userName?: string

    @IsOptional()
    @IsString()
    phoneNumber?: string

    @IsOptional()
    @IsNumber()
    @Type()
    level?: number

    @IsOptional()
    @IsObject()
    params?: ParamsDto
}

export class ListMyInviteUserDto {
    @IsOptional()
    @IsBoolean()
    isOpenCard?: boolean

    @IsOptional()
    @IsBoolean()
    isExchangeUsdt?: boolean
}

export class ReqUpdateInviteUserDto {
    @IsNumber()
    id: number

    @IsOptional()
    @IsString()
    nickName?: string

    @IsOptional()
    @IsString()
    avatar?: string
}