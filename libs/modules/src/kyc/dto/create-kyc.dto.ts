import { OmitType } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsObject, IsString } from "class-validator"
import { Kyc, KycCertifyInfo } from "../entities/kyc.entity"

export class CreateKycDto1 extends OmitType(Kyc, ['id','user'] as const) { }

export class CreateKycDto extends OmitType(Kyc, ['id', 'status', 'userId'] as const) {}

export class ListKycDto {
    @Type()
    @IsNumber()
    userId: number

    @IsString()
    status: string
}

export class ListMyKycDto {
    @IsString()
    status: string
}