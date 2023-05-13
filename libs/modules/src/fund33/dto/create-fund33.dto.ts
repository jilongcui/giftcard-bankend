import { IsNumber, IsString } from "class-validator";

export class CreateFund33Dto {}

export class LoginCardDto {
    @IsNumber()
    cardId: number
}

export class QueryBalanceDto {
    @IsNumber()
    cardId: number
}

export class ModifyPincodeDto {
    @IsNumber()
    cardId: number

    @IsString()
    oldPin: string

    @IsString()
    newPin: string
}

export class QueryRechargeDto {
    @IsNumber()
    cardId: number

    @IsNumber()
    amount: number
}