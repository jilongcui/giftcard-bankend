import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { Asset } from "@app/modules/collection/entities/asset.entity";
import { Payment } from "@app/modules/payment/entities/payment.entity";
import { Excel } from "@app/modules/common/excel/excel.decorator";
import { User } from "@app/modules/system/user/entities/user.entity";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    @IsNumber()
    @Excel({
        name: '订单ID'
    })
    id: number

    /* 商品描述 */
    @Column({
        name: 'desc',
        comment: '商品描述'
    })
    @IsString()
    @Excel({
        name: '商品描述'
    })
    desc: string

    /* 商品类型 0: "非实名卡", 1: "实名卡" */
    @Column({
        name: 'asset_type',
        comment: '商品类型 0: "非实名卡", 1: "实名卡"',
        type: 'char',
        length: 1,
        default: '0'
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '商品类型',
        readConverterExp: {
            0: "非实名卡", 1: "实名卡"
        }
    })
    assetType?: string

    /* 关联的商品 */
    @Column({
        name: 'asset_id',
        default: null,
        comment: '商品ID'
    })
    @IsOptional()
    @Type()
    @IsNumber()
    @Excel({
        name: '商品ID',
    })
    assetId?: number

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
        comment: '订单状态 0: 订单取消 1: 待付款 2: 待发货 3: 待收货 4: 交易成功',
        type: 'char',
        length: 1
    })
    @IsString()
    @Excel({
        name: '订单状态',
        readConverterExp: {
            0: "订单取消", 1: "待付款", 2: "待发货", 3: "待收货", 4: "交易成功"
        }
    })
    status: string

    /* 订单图片 */
    @Column({
        name: 'image',
        default: null,
        comment: '订单图片'
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '订单图片',
    })
    image?: string

    /* 用户留言 */
    @Column({
        name: 'remark',
        default: '',
        comment: '用户留言'
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '用户留言',
    })
    remark?: string

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

    /* 用户电话 */
    @Column({
        name: 'user_phone',
        default: '',
        comment: '用户电话'
    })
    @IsString()
    @Excel({
        name: '用户电话',
    })
    userPhone: string

    /* 收货地址 */
    @Column({
        name: 'home_address',
        default: '',
        comment: '收货地址'
    })
    @IsString()
    @Excel({
        name: '收货地址',
    })
    homeAddress: string

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
    @ManyToOne(() => User, user => user.orders)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ApiHideProperty()
    @OneToOne(() => Payment, payment => payment.order)
    @IsOptional()
    payment?: Payment
}
