import { Activity } from "@app/modules/activity/entities/activity.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
        name: 'desc',
        comment: '优先购活动的描述'
    })
    @IsString()
    desc: string

    /* 0: 设置中 1:活动开启 */
    // @Column({
    //     name: 'status',
    //     comment: '优先购活动状态 0: 设置中 1:活动开启',
    //     type: 'char',
    //     default: '0',
    //     length: 1
    // })
    // @IsString()
    // status: string

    /* 每人限购数量 0:不限购 */
    @Column({
        name: 'limit',
        default: 0, // 0 不限购
        comment: '每人限购数量'
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
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ApiHideProperty()
    @OneToOne(() => Activity)
    @JoinColumn({
        name: 'activity_id',
    })
    activity: Activity
}

