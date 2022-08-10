import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Collection } from "src/modules/collection/entities/collection.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Airdrop {
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
        name: 'user_id',
        comment: '管理的藏品集合'
    })
    @IsNumber()
    userId: number

    /* 空投发送状态 0: 未发送 1:发送中 2:发送成功 3:发送失败 */
    @Column({
        name: 'status',
        comment: '空投发送状态 0: 未发送 1:发送中 2:发送成功 3:发送失败',
        type: 'char',
        default: '0',
        length: 1
    })
    @IsString()
    status: string

    @Column({
        name: 'tx',
        comment: '交易id'
    })
    @IsOptional()
    @IsString()
    tx?: string

    /* 需要领取 0: 不需要领取，1:需要领取*/
    @Column({
        name: 'chain_id',
        comment: '链的Id',
        length: 1
    })
    @Type()
    chainId: number

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

