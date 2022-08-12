import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Airdrop } from "../entities/airdrop-activity.entity";

export class CreateAirdropDto extends OmitType(Airdrop, ['id',] as const) { }
export class UpdateAllAirdropDto extends Airdrop { }
export class UpdateAirdropDto extends PartialType(CreateAirdropDto) { }
export class UpdateAirdropStatusDto extends PickType(Airdrop, ['status']) { }
export class ListAirdropDto extends PartialType(OmitType(Airdrop, ['collection'] as const)) { }
export class ListMyAirdropDto {
    @IsOptional()
    @IsString()
    status?: string
}