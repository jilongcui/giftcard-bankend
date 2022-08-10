import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { PreemptionActivity } from "../entities/preemption-activity.entity";

export class CreatePreemptionActivityDto extends OmitType(PreemptionActivity, ['id',] as const) { }
export class UpdateAllPreemptionActivityDto extends PreemptionActivity { }
export class UpdatePreemptionActivityDto extends PartialType(CreatePreemptionActivityDto) { }
export class UpdatePreemptionActivityStatusDto extends PickType(PreemptionActivity, ['status']) { }
export class ListPreemptionActivityDto extends PartialType(PreemptionActivity) { }
export class ListMyPreemptionActivityDto {
    @IsOptional()
    @IsString()
    status?: string
}