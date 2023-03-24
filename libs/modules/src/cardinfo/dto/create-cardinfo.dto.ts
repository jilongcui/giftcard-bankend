import { IsNumber, IsObject, IsString } from "class-validator"

export class CreateCardinfoDto {
    @IsString()
    name: string

    @IsObject()
    info: CardInfoDto

}

export class CardInfoDto {
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

export class ListCardinfoDto {
    @IsString()
    name: string     
}
