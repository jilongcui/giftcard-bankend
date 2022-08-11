import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Preemption } from "../entities/preemption.entity";

export class CreatePreemptionDto extends OmitType(Preemption, ['id'] as const) { }
export class UpdateAllPreemptionDto extends Preemption { }
export class UpdatePreemptionDto extends PartialType(CreatePreemptionDto) { }
export class ListPreemptionDto extends PartialType(OmitType(Preemption, ['activity'] as const)) { }
export class ListMyPreemptionDto {
    @IsOptional()
    @IsString()
    status?: string
}