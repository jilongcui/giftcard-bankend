import { OmitType, PartialType } from "@nestjs/swagger";
import { Activity } from "../entities/activity.entity";

export class CreateActivityDto extends OmitType(Activity, ['id', 'status', 'preemption'] as const) {
    'preemption': {
        'activityId': number,
        'desc': string,
        'limit': number,
        'startTime': Date
    }
}
export class UpdateAllActivityDto extends Activity { }
export class UpdateActivityDto extends PartialType(Activity) { }
export class ListActivityDto extends PartialType(OmitType(Activity, ['collections', 'orders', 'preemption'] as const)) { }
