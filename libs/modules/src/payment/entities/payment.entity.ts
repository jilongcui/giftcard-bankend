import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Type } from "class-transformer";
import { Order } from "@app/modules/order/entities/order.entity";
import { Bankcard } from "@app/modules/bankcard/entities/bankcard.entity";

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
        comment: '支付种类 0: 余额支付 1:银行卡支付 2:余额充值',
        type: 'char',
        length: 1
    })
    @IsString()
    type: string

    /* 订单状态 0: 订单取消，1:未支付 2: 订单完成 3: 订单过期*/
    @Column({
        name: 'status',
        comment: '订单状态 0:未支付 1: 支付完成 3: 支付失败',
        type: 'char',
        length: 1
    })
    @IsString()
    status: string

    @Column({
        name: 'order_id',
        comment: '关联的订单'
    })
    @IsOptional()
    @Type()
    @IsNumber()
    orderId?: number

    /* 一级市场 */
    @ApiHideProperty()
    @OneToOne(() => Order, order => order.payment)
    @IsOptional()
    @JoinColumn({
        name: 'order_id',
    })
    order?: Order

    @Column({
        name: 'bankcard_id',
        comment: '关联的银行卡'
    })
    @IsOptional()
    @Type()
    @IsNumber()
    bankcardId?: number

    /* 关联的银行卡 */
    @ApiHideProperty()
    @ManyToOne(() => Bankcard)
    @JoinColumn({
        name: 'bankcard_id',
    })
    bankcard?: Bankcard


    @Column({
        name: 'user_id',
        comment: '订单所属用户'
    })
    @IsNumber()
    userId: number

    @ApiHideProperty()
    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

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
