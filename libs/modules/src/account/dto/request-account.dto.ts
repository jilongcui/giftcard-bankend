import { OmitType, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber } from "class-validator";
import { Account } from "../entities/account.entity";

export class CreateAccountDto extends OmitType(Account, ['id', 'createTime'] as const) {
    @Type()
    @IsNumber()
    userId: number

    @Type()
    @IsNumber()
    currencyId: number
}
export class UpdateAllAccountDto extends Account { }
export class UpdateAccountDto extends PartialType(CreateAccountDto) { }
export class ListAccountDto extends PartialType(OmitType(Account, ['user', 'currency'] as const)) { }