import { IsNumber, IsString } from "class-validator"

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
    feeRatio: number

    @IsNumber()
    rechargeRatio: number

    @IsNumber()
    rechargeMinFee: number

    @IsNumber()
    validDay: number

    @IsString()
    amountPerMonth: string

    @IsString()
    image: string

    @IsString()
    signImage: string

}