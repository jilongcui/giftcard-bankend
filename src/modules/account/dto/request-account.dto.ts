import { OmitType, PartialType } from "@nestjs/swagger";
import { Account } from "../entities/account.entity";

export class CreateAccountDto extends OmitType(Account, ['id', 'createTime'] as const) { }
export class UpdateAllAccountDto extends Account { }
export class UpdateAccountDto extends PartialType(CreateAccountDto) { }
export class ListAccountDto extends PartialType(Account) { }