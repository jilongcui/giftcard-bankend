import { OmitType, PartialType } from "@nestjs/swagger";
import { ProfitRecord, ProfitSubType, ProfitType } from "../entities/profit_record.entity";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class CreateProfitRecordDto extends OmitType(ProfitRecord, ['id', 'createTime'] as const) { }
export class ListProfitRecordDto extends PartialType(OmitType(ProfitRecord, ['id'] as const)) { }
export class ListMyProfitRecordDto {
    @IsOptional()
    @IsEnum(ProfitType)
    type?: ProfitType
}

export class GetTotalProfitDto {
    @IsOptional()
    @IsEnum(ProfitType)
    type?: ProfitType
}

