import { IsNumber, IsOptional, IsString } from "class-validator"

export class MemberInfo {
    @IsString()
    typeName: string

    @IsString()
    typeId: string

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
    validDay: number

    @IsNumber()
    quotaPerMonth: number
}