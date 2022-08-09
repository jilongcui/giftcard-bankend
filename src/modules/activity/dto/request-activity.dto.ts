import { OmitType, PartialType } from "@nestjs/swagger";
import { Activity } from "../entities/activity.entity";

export class CreateActivityDto extends OmitType(Activity, ['id'] as const) { }
export class UpdateAllActivityDto extends Activity { }
export class UpdateActivityDto extends PartialType(Activity) { }
export class ListActivityDto extends PartialType(Activity) { }
