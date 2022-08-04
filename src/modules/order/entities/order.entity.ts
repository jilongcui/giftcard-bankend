import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { Activity } from "src/modules/activity/entities/activity.entity";
import { Collection } from "src/modules/collection/entities/collection.entity";
import { User } from "src/modules/system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Order {
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
        name: 'activity_id',
        comment: '订单关联的活动'
    })
    @IsNumber()
    activityId: number

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

    @ApiHideProperty()
    @ManyToOne(() => Activity, activity => activity.orders)
    @JoinColumn({
        name: 'activity_id',
    })
    activity: Activity

    @ApiHideProperty()
    @ManyToOne(() => User, user => user.orders)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ApiHideProperty()
    @ManyToMany(() => Collection, collection => collection.orders)
    collections: Collection[]
}
