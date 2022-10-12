import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Activity } from "../../activity/entities/activity.entity";
import { Collection } from "../../collection/entities/collection.entity";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { Asset } from "@app/modules/collection/entities/asset.entity";
import { Bankcard } from "@app/modules/bankcard/entities/bankcard.entity";
import { Payment } from "@app/modules/payment/entities/payment.entity";
import { Excel } from "@app/modules/common/excel/excel.decorator";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    @IsNumber()
    @Excel({
        name: '订单ID'
    })
    id: number

    /* 订单描述 */
    @Column({
        name: 'desc',
        comment: '订单描述'
    })
    @IsString()
    @Excel({
        name: '订单描述'
    })
    desc: string

    /* 资产类型 0: "藏品", 1: "盲盒" */
    @Column({
        name: 'asset_type',
        comment: '资产类型 0: "藏品", 1: "盲盒"',
        type: 'char',
        length: 1,
        default: '0'
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '资产类型',
        readConverterExp: {
            0: "藏品", 1: "盲盒"
        }
    })
    assetType?: string

    /* 订单种类 0: 活动 1:市场 2: 充值订单 */
    @Column({
        name: 'type',
        comment: '订单种类 0: 活动 1:市场 2: 充值订单',
        type: 'char',
        length: 1
    })
    @IsString()
    @Excel({
        name: '订单类型',
        readConverterExp: {
            0: "活动", 1: "市场", 2: "充值订单"
        }
    })
    type: string

    /* 订单总金额 */
    @Column({
        name: 'total_price',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '订单总金额'
    })
    @IsNumber()
    @Excel({
        name: '订单总金额',
    })
    totalPrice: number

    /* 订单金额 */
    @Column({
        name: 'real_price',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '订单真实金额'
    })
    @IsOptional()
    @IsNumber()
    @Excel({
        name: '真实金额',
    })
    realPrice?: number

    /* 订单数量 */
    @Column({
        name: 'count',
        default: '0',
        comment: '订单数量'
    })
    @Type()
    @IsOptional()
    @IsNumber()
    @Excel({
        name: '订单数量',
    })
    count?: number

    /* 订单状态 0: 订单取消，1:支付中 2: 订单完成 3: 订单过期*/
    @Column({
        name: 'status',
        comment: '订单状态 0: 订单取消 1: 支付中 2: 订单完成 3: 订单过期',
        type: 'char',
        length: 1
    })
    @IsString()
    @Excel({
        name: '订单描述',
        readConverterExp: {
            0: "订单取消", 1: "支付中", 2: "订单完成", 3: "订单过期"
        }
    })
    status: string

    /* 订单图片 */
    @Column({
        name: 'image',
        comment: '订单图片'
    })
    @IsString()
    @Excel({
        name: '订单图片',
    })
    image: string

    /* 关联的活动 */
    @Column({
        name: 'activity_id',
        default: null,
        comment: '订单关联的活动'
    })
    @IsOptional()
    @Type()
    @IsNumber()
    @Excel({
        name: '订单活动ID',
    })
    activityId?: number

    /* 订单关联的资产 */
    @Column({
        name: 'asset_id',
        default: null,
        comment: '订单关联的资产'
    })
    @IsOptional()
    @Type()
    @IsNumber()
    @Excel({
        name: '订单资产ID',
    })
    assetId?: number

    // @Column({
    //     name: 'collection_id',
    //     comment: '订单关联的藏品'
    // })
    // @IsNumber()
    // collectionId: number

    /* 订单所属用户 */
    @Column({
        name: 'user_id',
        comment: '订单所属用户'
    })
    @IsNumber()
    @Excel({
        name: '订单用户ID',
    })
    userId: number

    @Column({
        name: 'user_name',
        default: '',
        comment: '订单所属用户'
    })
    @IsString()
    @Excel({
        name: '订单用户名',
    })
    userName: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    @Excel({
        name: '创建时间',
    })
    createTime: number

    @ApiHideProperty()
    @Column({
        name: 'invalid_time',
        type: 'datetime',
        comment: '订单失效时间'
    })
    @Excel({
        name: '失效时间',
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
    @OneToOne(() => Payment, payment => payment.order)
    @IsOptional()
    payment?: Payment

    /* 一级市场 */
    @ApiHideProperty()
    @ManyToOne(() => Activity, activity => activity.orders)
    @IsOptional()
    @JoinColumn({
        name: 'activity_id',
    })
    activity?: Activity

    // @ApiHideProperty()
    // @ManyToOne(() => Bankcard)
    // @JoinColumn({
    //     name: 'bankcard_id',
    // })
    // bankcard: Bankcard

    /* 二级市场 */
    // @ApiHideProperty()
    // @ManyToOne(() => Asset)
    // @JoinColumn({
    //     name: 'asset_id',
    // })
    // asset?: Asset

    @ApiHideProperty()
    @ManyToOne(() => User, user => user.orders)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ApiHideProperty()
    @IsOptional()
    @ManyToMany(() => Collection, collection => collection.orders)
    collections?: Collection[]
}
