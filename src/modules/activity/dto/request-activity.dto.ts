import { OmitType, PartialType } from "@nestjs/swagger";
import { Activity } from "../entities/activity.entity";

export class CreateActivityDto extends OmitType(Activity, ['id', 'status'] as const) { }
export class UpdateActivityDto extends PartialType(Activity) { }
export class ListActivityDto extends PartialType(Activity) { }
