import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString } from "class-validator"
import { Withdraw } from "../entities/withdraw.entity"
import { OmitType, PartialType } from "@nestjs/swagger"

export class ListWithdrawDto extends PartialType(OmitType(Withdraw, ['user'] as const)) { }

export class CreateWithdrawDto {
    @Type()
    @IsNumber()
    addressId: number

    @IsString()
    toAddress: string

    @Type()
    @IsNumber()
    amount: number
}

export class WithdrawWithCardDto {
    @IsNumber()
    withdrawId: number

    @IsNumber()
    fromAddressId: number
}

export class ReqConfirmPayDto {
    version: number
    hy_token_id: string
    verify_code: string
}

export class ConfirmWithdrawDto {
    @Type()
    @IsNumber()
    withdrawId: number
}

export class ConfirmPayWithCardDto {
    @IsNumber()
    fundId: number

    @IsString()
    verifyCode: string
}

export class ListMyWithdrawDto {
    @IsOptional()
    @IsString()
    status?: string
}

