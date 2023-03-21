import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { MagicboxRecord } from "../entities/magicbox-record.entity";

export class CreateMagicboxRecordDto extends OmitType(MagicboxRecord, ['id', 'createTime'] as const) { }
export class UpdateMagicboxRecordDto extends MagicboxRecord { }
export class ListMagicboxRecordDto extends PartialType(MagicboxRecord) { }