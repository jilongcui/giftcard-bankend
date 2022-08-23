import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column } from "typeorm";
import { Bankcard } from "../entities/bankcard.entity";

export class CreateBankcardDto extends OmitType(Bankcard, ['id', 'status', 'userId', 'signTradeNo', 'signNo'] as const) { }
export class UpdateAllBankcardDto extends Bankcard { }
export class UpdateBankcardDto extends PartialType(Bankcard) { }
export class UpdateBankcardStatusDto extends PickType(Bankcard, ['status']) { }
export class ListBankcardDto extends PartialType(OmitType(Bankcard, ['user'] as const)) { }

export class ListMyBankcardDto {
    @IsOptional()
    @IsString()
    status?: string
}