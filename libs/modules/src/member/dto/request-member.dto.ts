import { ParamsDto } from "@app/common/dto/params.dto"
import { Type } from "class-transformer"
import { IsOptional, IsString, IsNumber, IsObject } from "class-validator"

/* 升级会员等级 */
export class CreateMemberDto {
    @IsNumber()
    memberInfoId: number
}

export class ListMemberDto {
    @IsOptional()
    @IsString()
    level?: string

    @IsOptional()
    @IsString()
    status?: string
}
