import { Activity } from "@app/modules/activity/entities/activity.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PreemptionWhitelist {
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
        name: 'user_id',
        comment: '关联的用户'
    })
    @IsNumber()
    userId: number

    /* 优先购状态 0: 为购买 1:已购买 */
    @Column({
        name: 'status',
        comment: '优先购状态 0: 为购买 1:已购买',
        type: 'char',
        default: '0',
        length: 1
    })
    @IsString()
    status: string

    @Column({
        name: 'count',
        comment: '已购买数量'
    })
    @IsOptional()
    @IsNumber()
    count?: number

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ApiHideProperty()
    @ManyToOne(() => Activity)
    @JoinColumn({
        name: 'collection_id',
    })
    activity: Activity
}

