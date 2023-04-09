import { IsNumber, IsOptional, IsString } from "class-validator"

export class CreateApplyCardDto {
    @IsNumber()
    cardinfoId: number

    @IsNumber()
    kycId: number
}

export class ListMyApplyCardDto {
    @IsOptional()
    @IsNumber()
    status?: number
}
