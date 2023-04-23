import { OmitType } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator"
import { Kyc, KycCertifyInfo } from "../entities/kyc.entity"

export class CreateKycDto1 extends OmitType(Kyc, ['id','user'] as const) { }

export class CreateKycDto extends OmitType(Kyc, ['id', 'status', 'userId'] as const) {}

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