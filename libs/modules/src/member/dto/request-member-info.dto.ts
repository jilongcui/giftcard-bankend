import { ParamsDto } from "@app/common/dto/params.dto"
import { Type } from "class-transformer"
import { IsOptional, IsString, IsNumber, IsObject } from "class-validator"

/* 升级会员等级 */
export class CreateMemberInfoDto {
    @IsOptional()
    @IsNumber()
    index?: number

    @IsString()
    name: string

    @IsNumber()
    days: number

    @IsString()
    desc: string

    @IsNumber()
    price: number

    @IsOptional()
    @IsString()
    level?: string

    @IsOptional()
    @IsString()
    status?: string
}

export class ListMemberInfoDto {
    @IsOptional()
    @IsString()
    status?: string
}
