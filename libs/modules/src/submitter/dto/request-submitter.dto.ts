import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Submitter } from "../entities/submitter.entity";

export class CreateSubmitterDto extends OmitType(Submitter, ['id', 'status',] as const) { }
export class UpdateAllSubmitterDto extends Submitter { }
export class UpdateSubmitterDto extends PartialType(Submitter) { }
export class UpdateSubmitterStatusDto extends PickType(Submitter, ['status']) { }
export class ListSubmitterDto extends PartialType(OmitType(Submitter, ['id'] as const)) { }

export class ListMySubmitterDto {
    @IsOptional()
    @IsString()
    status?: string
}