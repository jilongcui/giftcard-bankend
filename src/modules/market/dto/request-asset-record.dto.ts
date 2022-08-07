import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { AssetRecord } from "../entities/asset-record.entity";

export class CreateAssetRecordDto extends OmitType(AssetRecord, ['id'] as const) { }
export class UpdateAssetRecordDto extends AssetRecord { }
export class ListAssetRecordDto extends PartialType(AssetRecord) { }