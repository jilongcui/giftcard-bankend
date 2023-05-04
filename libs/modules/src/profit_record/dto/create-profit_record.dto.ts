import { OmitType, PartialType } from "@nestjs/swagger";
import { ProfitRecord, ProfitType } from "../entities/profit_record.entity";
import { IsOptional, IsString } from "class-validator";

export class CreateProfitRecordDto extends OmitType(ProfitRecord, ['id'] as const) { }
export class ListProfitRecordDto extends PartialType(OmitType(ProfitRecord, ['id'] as const)) { }
export class ListMyProfitRecordDto {
    @IsOptional()
    @IsString()
    type?: ProfitType
}

