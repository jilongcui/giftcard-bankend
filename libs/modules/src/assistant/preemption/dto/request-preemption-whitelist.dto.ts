import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { PreemptionWhitelist } from "../entities/preemptionWhitelist.entity";

export class CreatePreemptionWhitelistDto extends OmitType(PreemptionWhitelist, ['id', 'status'] as const) { }
export class UpdateAllPreemptionWhitelistDto extends PreemptionWhitelist { }
export class UpdatePreemptionWhitelistDto extends PartialType(CreatePreemptionWhitelistDto) { }
export class UpdatePreemptionStatusDto extends PickType(PreemptionWhitelist, ['status']) { }
export class ListPreemptionWhitelistDto extends PartialType(OmitType(PreemptionWhitelist, ['activity'] as const)) { }
export class ListMyPreemptionWhitelistDto {
    @IsOptional()
    @IsString()
    status?: string
}