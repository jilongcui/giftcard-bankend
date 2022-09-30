import { Collection } from "@app/modules/collection/entities/collection.entity";
import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { Activity } from "../entities/activity.entity";


// export class CreateActivityDto extends OmitType(Activity, ['id', 'top', 'supply', 'avatar', 'authorName', 'status', 'preemption'] as const) {
//     preemption?: {
//         activityId: number,
//         desc: string,
//         limit: number,
//         startTime: Date
//     }
//     collections?: Collection[]
// }
type CollectionId = {
    id: number
}
export class CreateActivityDto {
    preemption?: {
        activityId: number,
        desc: string,
        limit: number,
        startTime: Date
    }
    collections: CollectionId[]
    type: string
    title: string
    ruleInfo: string
    startTime: Date
    coverImage: string
    endTime: Date
    current: number
    price: number
}
export class UpdateAllActivityDto extends Activity { }
export class UpdateActivityDto extends PartialType(Activity) { }
export class ListActivityDto extends PartialType(OmitType(Activity, ['collections', 'orders', 'preemption'] as const)) { }
