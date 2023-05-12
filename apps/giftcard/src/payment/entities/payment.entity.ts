import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Type } from "class-transformer";
import { User } from "@app/modules/system/user/entities/user.entity";
import { Bankcard } from "../../bankcard/entities/bankcard.entity";
import { Order } from "../../order/entities/order.entity";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'type',
        default: '0',
        comment: '支付种类 0: 余额支付 1:银行卡支付 2: 微信支付',
        type: 'char',
        length: 1
    })
    @IsString()
    type: string

    /* 支付状态 0: 未支付 1: 支付中 2: 支付完成 3: 支付失败 */
    @Column({
        name: 'status',
        default: '0',
        comment: '支付状态 0: 未支付 1: 支付中 2: 支付完成 3: 支付失败',
        type: 'char',
        length: 1
    })
    @IsString()
    status: string

    /* 来自支付平台的 支付订单创建成功标志 */
    @Column({
        name: 'order_token_id',
        comment: '来自支付平台的 支付订单创建成功标志',
        length: 160
    })
    @IsOptional()
    @IsString()
    orderTokenId?: string

    /* 来自支付平台的 确认订单后，汇付宝单据号 */
    @Column({
        name: 'order_bill_no',
        default: '',
        comment: '来自支付平台的 确认订单后，汇付宝单据号',
        length: 50
    })
    @IsOptional()
    @IsString()
    orderBillNo?: string

    @Column({
        name: 'order_id',
        default: null,
        comment: '关联的订单'
    })
    @IsOptional()
    @Type()
    @IsNumber()
    orderId?: number

    /* 一级市场 */
    @ApiHideProperty()
    @OneToOne(() => Order)
    @JoinColumn({
        name: 'order_id',
    })
    order?: Order

    @Column({
        name: 'bankcard_id',
        default: null,
        comment: '关联的银行卡'
    })
    @IsOptional()
    @Type()
    @IsNumber()
    bankcardId?: number

    /* 关联的银行卡 */
    @ApiHideProperty()
    @ManyToOne(() => Bankcard)
    @IsOptional()
    @JoinColumn({
        name: 'bankcard_id',
    })
    bankcard?: Bankcard


    @Column({
        name: 'user_id',
        comment: '订单所属用户'
    })
    @IsOptional()
    @IsNumber()
    userId?: number

    @ApiHideProperty()
    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user?: User

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ApiHideProperty()
    @UpdateDateColumn({
        name: 'update_time',
        comment: '更新时间'
    })
    updateTime: Date
}
