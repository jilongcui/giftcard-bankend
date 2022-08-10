import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { AirdropActivity } from "../entities/airdrop-activity.entity";

export class CreateAirdropActivityDto extends OmitType(AirdropActivity, ['id',] as const) { }
export class UpdateAllAirdropActivityDto extends AirdropActivity { }
export class UpdateAirdropActivityDto extends PartialType(CreateAirdropActivityDto) { }
export class UpdateAirdropActivityStatusDto extends PickType(AirdropActivity, ['status']) { }
export class ListAirdropActivityDto extends PartialType(AirdropActivity) { }
export class ListMyAirdropActivityDto {
    @IsOptional()
    @IsString()
    status?: string
}