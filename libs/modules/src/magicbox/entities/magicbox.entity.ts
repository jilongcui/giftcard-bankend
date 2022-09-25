import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Asset } from "@app/modules/collection/entities/asset.entity";
import { Activity } from "@app/modules/activity/entities/activity.entity";
import { Collection } from "@app/modules/collection/entities/collection.entity";

@Entity()
export class Magicbox {
    @PrimaryGeneratedColumn({
        name: 'id',
        comment: '盲盒Id'
    })
    @Type()
    @IsNumber()
    id: number

    // @Column({
    //     name: 'asset_no',
    //     comment: '盲盒编号'
    // })
    // @Type()
    // @IsNumber()
    // assetNo: number

    @Column({
        name: 'price',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '当前价值(单位人民币)'
    })
    @Type()
    @IsNumber()
    price: number

    @Column({
        name: 'user_id',
        comment: '用户id'
    })
    @Type()
    @IsNumber()
    userId: number

    @ApiHideProperty()
    @ManyToOne(type => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @Column({
        name: 'open_status',
        comment: '状态(0:未售出 1: 已售出 2: 已开启 )',
        type: 'char',
        default: '0'
    })
    @IsString()
    openStatus: string

    @Column({
        name: 'status',
        comment: '市场状态(0:下架 1: 上架 2:锁定)',
        type: 'char',
        default: '0'
    })
    @IsString()
    status: string

    @Column({
        name: 'asset_id',
        comment: '藏品id'
    })
    @Type()
    @IsNumber()
    assetId: number

    @ApiHideProperty()
    @ManyToOne(type => Asset)
    @JoinColumn({
        name: 'asset_id',
    })
    asset: Asset

    @Column({
        name: 'collection_id',
        comment: '藏品id'
    })
    @Type()
    @IsNumber()
    collectionId: number

    @Column({
        name: 'index',
        comment: '藏品index'
    })
    @Type()
    @IsNumber()
    index: number

    @ApiHideProperty()
    @ManyToOne(type => Collection)
    @JoinColumn({
        name: 'collection_id',
    })
    collection: Collection

    @Column({
        name: 'activity_id',
        comment: '活动id'
    })
    @Type()
    @IsNumber()
    activityId: number

    @ApiHideProperty()
    @ManyToOne(type => Activity)
    @JoinColumn({
        name: 'activity_id',
    })
    activity: Activity

    /* 创建时间 */
    @ApiHideProperty()
    @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
    createTime: number

    /* 更新时间 */
    @ApiHideProperty()
    @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
    updateTime: Date
}
