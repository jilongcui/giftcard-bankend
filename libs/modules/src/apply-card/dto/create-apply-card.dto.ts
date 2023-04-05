import { IsNumber, IsOptional, IsString } from "class-validator"

export class CreateApplyCardDto {
    @IsNumber()
    cardInfoId: number

    @IsNumber()
    kycId: number
}

export class ListMyApplyCardDto {
    @IsOptional()
    @IsNumber()
    status?: number
}
