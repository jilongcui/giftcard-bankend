import { IsNumber } from "class-validator";

export class CreateFund33Dto {}

export class LoginCardDto {
    @IsNumber()
    cardId: number
}

export class QueryBalanceDto {
    @IsNumber()
    cardId: number
}

export class QueryRechargeDto {
    @IsNumber()
    cardId: number

    @IsNumber()
    amount: number
}