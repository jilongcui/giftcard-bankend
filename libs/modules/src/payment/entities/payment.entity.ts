import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Activity } from "../../activity/entities/activity.entity";
import { Collection } from "../../collection/entities/collection.entity";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { Asset } from "@app/modules/collection/entities/asset.entity";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'desc',
        comment: '订单描述'
    })
    @IsString()
    desc: string

    @Column({
        name: 'type',
        comment: '订单种类 0: 活动 1:市场',
        type: 'char',
        length: 1
    })
    @IsString()
    type: string

    @Column({
        name: 'total_price',
        comment: '订单总金额'
    })
    @IsNumber()
    totalPrice: number

    @Column({
        name: 'real_price',
        comment: '订单真实金额'
    })
    @IsNumber()
    realPrice: number

    @Column({
        name: 'count',
        default: '0',
        comment: '订单数量'
    })
    @IsNumber()
    count: number

    /* 订单状态 0: 订单取消，1:未支付 2: 订单完成 3: 订单过期*/
    @Column({
        name: 'status',
        comment: '订单状态 0: 订单取消，1:未支付 2: 订单完成 3: 订单过期',
        type: 'char',
        length: 1
    })
    @IsString()
    status: string

    @Column({
        name: 'image',
        comment: '订单图片'
    })
    @IsString()
    image: string

    @Column({
        name: 'activity_id',
        default: null,
        comment: '订单关联的活动'
    })
    @IsOptional()
    @Type()
    @IsNumber()
    activityId?: number

    @Column({
        name: 'asset_id',
        default: null,
        comment: '订单关联的活动'
    })
    @IsOptional()
    @Type()
    @IsNumber()
    assetId?: number

    // @Column({
    //     name: 'collection_id',
    //     comment: '订单关联的藏品'
    // })
    // @IsNumber()
    // collectionId: number

    @Column({
        name: 'user_id',
        comment: '订单所属用户'
    })
    @IsNumber()
    userId: number

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ApiHideProperty()
    @Column({
        name: 'invalid_time',
        type: 'datetime',
        comment: '订单失效时间'
    })
    invalidTime: Date

    // @ApiHideProperty()
    // @IsArray()
    // @Column({
    //     name: 'images',
    //     comment: '图片',
    //     type: 'simple-array',
    // })
    // images: string[]

    /* 一级市场 */
    @ApiHideProperty()
    @ManyToOne(() => Activity, activity => activity.payments)
    @IsOptional()
    @JoinColumn({
        name: 'activity_id',
    })
    activity?: Activity

    /* 二级市场 */
    // @ApiHideProperty()
    // @ManyToOne(() => Asset)
    // @JoinColumn({
    //     name: 'asset_id',
    // })
    // asset?: Asset

    @ApiHideProperty()
    @ManyToOne(() => User, user => user.payments)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ApiHideProperty()
    @IsOptional()
    @ManyToMany(() => Collection, collection => collection.payments)
    collections?: Collection[]
}
