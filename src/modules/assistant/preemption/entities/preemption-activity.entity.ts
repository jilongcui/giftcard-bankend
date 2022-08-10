import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Activity } from "src/modules/activity/entities/activity.entity";
import { Collection } from "src/modules/collection/entities/collection.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PreemptionActivity {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'activity_id',
        comment: '关联的活动'
    })
    @IsNumber()
    activityId: number

    @Column({
        name: 'desc',
        comment: '优先购活动的描述'
    })
    @IsString()
    desc: string

    /* 0: 设置中 1:活动开启 */
    @Column({
        name: 'status',
        comment: '优先购活动状态 0: 设置中 1:活动开启',
        type: 'char',
        default: '0',
        length: 1
    })
    @IsString()
    status: string

    @Column({
        name: 'limit',
        comment: '优先购的数量'
    })
    @IsOptional()
    @IsNumber()
    limit?: number

    @ApiHideProperty()
    @Column({
        name: 'start_time',
        type: 'datetime',
        comment: '优先购活动开始时间'
    })
    startTime: Date

    @ApiHideProperty()
    @Column({
        name: 'end_time',
        type: 'datetime',
        comment: '优先购活动结束时间'
    })
    @IsOptional()
    endTime?: Date

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ApiHideProperty()
    @ManyToOne(() => Activity)
    @JoinColumn({
        name: 'activity_id',
    })
    activity: Activity
}

