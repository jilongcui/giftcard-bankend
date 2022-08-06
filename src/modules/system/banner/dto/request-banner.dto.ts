import { OmitType, PartialType } from "@nestjs/swagger";
import { Banner } from "../entities/banner.entity";

export class CreateBannerDto extends OmitType(Banner, ['id', 'createTime'] as const) { }
export class UpdateAllBannerDto extends Banner { }
export class UpdateBannerDto extends PartialType(CreateBannerDto) { }
export class ListBannerDto extends PartialType(Banner) { }