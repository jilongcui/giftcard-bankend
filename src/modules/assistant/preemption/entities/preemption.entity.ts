import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Activity } from "src/modules/activity/entities/activity.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Preemption {
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

    /* 空投发送状态 0: 未发送 1:发送中 2:发送成功 3:发送失败 */
    @Column({
        name: 'status',
        comment: '空投发送状态 0: 为购买 1:已购买',
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
    collection: Activity
}

