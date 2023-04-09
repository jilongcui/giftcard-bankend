import { IsNumber, IsOptional, IsString } from "class-validator"

export class CardInfoDetail {
    @IsString()
    typeName: string

    @IsString()
    typeId: string

    @IsNumber()
    openFee: number

    @IsNumber()
    monthFee: number

    @IsNumber()
    upgradeFee: number

    @IsNumber()
    exchangeToHKDRatio: number

    @IsNumber()
    exchangeToCardRatio: number

    @IsNumber()
    transferFee: number

    @IsNumber()
    rechargeRatio: number

    @IsNumber()
    rechargeMinFee: number

    @IsNumber()
    validDay: number

    @IsNumber()
    quotaPerMonth: number

    @IsOptional()
    @IsString()
    image?: string
}