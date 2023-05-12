import { OmitType, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { AccountFlow } from "../entities/account-flow.entity";

export class CreateAccountFlowDto extends OmitType(AccountFlow, ['id', 'createTime'] as const) {
    @Type()
    @IsNumber()
    userId: number

    @Type()
    @IsNumber()
    currencyId: number
}
export class UpdateAllAccountFlowDto extends AccountFlow { }
export class UpdateAccountFlowDto extends PartialType(CreateAccountFlowDto) { }
export class ListAccountFlowDto extends PartialType(OmitType(AccountFlow, [] as const)) { }
export class ListMyAccountFlowDto extends PartialType(OmitType(AccountFlow, ['userId'] as const)) { }

export class ExhangeAccountFlowDto {
    @Type()
    @IsNumber()
    currIdFrom: number

    @Type()
    @IsNumber()
    currIdTo: number

    @Type()
    @IsNumber()
    amount: number
}

export class TransferAccountFlowDto {
    @Type()
    @IsString()
    userTo: string // userName, phonenumber, email

    @Type()
    @IsNumber()
    currencyId: number

    @Type()
    @IsNumber()
    amount: number
}