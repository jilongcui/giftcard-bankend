import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Activity } from "src/modules/activity/entities/activity.entity";
import { Collection } from "src/modules/collection/entities/collection.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AirdropActivity {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'collection_id',
        comment: '管理的藏品集合'
    })
    @IsNumber()
    collectionId: number

    @Column({
        name: 'desc',
        comment: '空投活动的描述'
    })
    @IsString()
    desc: string

    /* 需要领取 0: 不需要领取，1:需要领取*/
    @Column({
        name: 'need_claim',
        comment: '是否需要领取 false: 不需要领取，true:需要领取',
        type: 'char',
        length: 1
    })
    @IsString()
    needClaim: boolean

    /* 空投活动状态 0: 导入用户，1:开始空投 2: 空投完成 3: 空投取消 */
    @Column({
        name: 'status',
        comment: '空投活动状态 0: 导入用户，1:开始空投 2: 空投完成 3: 空投取消',
        type: 'char',
        default: '0',
        length: 1
    })
    @IsString()
    status: string

    @ApiHideProperty()
    @Column({
        name: 'start_time',
        type: 'datetime',
        comment: '空投活动开始时间'
    })
    startTime: Date

    @ApiHideProperty()
    @Column({
        name: 'end_time',
        type: 'datetime',
        comment: '空投活动结束时间'
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
    @ManyToOne(() => Collection)
    @JoinColumn({
        name: 'collection_id',
    })
    collection: Collection
}

