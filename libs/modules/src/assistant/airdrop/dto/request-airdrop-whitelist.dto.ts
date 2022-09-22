import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { AirdropWhitelist } from "../entities/airdrop-whitelist.entity";

export class CreateAirdropWhitelistDto extends OmitType(AirdropWhitelist, ['id',] as const) { }
export class UpdateAllAirdropWhitelistDto extends AirdropWhitelist { }
export class UpdateAirdropWhitelistDto extends PartialType(CreateAirdropWhitelistDto) { }
export class UpdateAirdropWhitelistStatusDto extends PickType(AirdropWhitelist, ['status']) { }
export class ListAirdropWhitelistDto extends PartialType(OmitType(AirdropWhitelist, ['user', 'collection'] as const)) { }
export class ListMyAirdropWhitelistDto {
    @IsOptional()
    @IsString()
    status?: string
}