import { OmitType } from "@nestjs/swagger"
import { IsString } from "class-validator"
import { Kyc } from "../entities/kyc.entity"

export class CreateKycDto extends OmitType(Kyc, ['id', 'createTime', 'user', 'status'] as const) { }

export class KycCertifyInfoDto {
    @IsString()
    userName: string

    @IsString()
    cardId: string

    @IsString()
    cardType: string

    @IsString()
    cardFrontImage: string

    @IsString()
    cardBackImage: string

    @IsString()
    signImage: string

}

export class ListKycDto {
    userId: number
    status: string
}

export class ListMyKycDto {
    status: string
}