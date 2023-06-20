import { OmitType } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator"
import { Kyc, KycCertifyInfo } from "../entities/kyc.entity"

export class CreateKycDto extends OmitType(Kyc, ['id','user', 'createTime'] as const) {}


export class CreateKycInfoDto extends OmitType(KycCertifyInfo, ['cardNumber', 'notifyUrl'] as const) {}

export class ListKycDto {
    @Type()
    @IsNumber()
    @IsOptional()
    userId?: number

    @IsString()
    @IsOptional()
    status?: string
}

export class ListMyKycDto {
    @IsString()
    @IsOptional()
    status?: string
}