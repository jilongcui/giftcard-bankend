import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Type } from "class-transformer";
import { WithdrawFlow } from "./withdraw-flow.entity";
import { Bankcard } from "apps/giftcard/src/bankcard/entities/bankcard.entity";
import { Excel } from "@app/modules/common/excel/excel.decorator";

@Entity('bank_withdraw')
export class Withdraw {
    @PrimaryGeneratedColumn()
    @Excel({
        name: '订单ID'
    })
    @Type()
    @IsNumber()
    id: number

    @Column({
        name: 'type',
        default: '0',
        comment: '提现种类 1:提现到银行卡 2: 提现到微信 3: 提现到支付宝',
        type: 'char',
        length: 1
    })
    @Excel({
        name: '提现种类'
    })
    @IsString()
    type: string

    /* 提现状态 0: 等待审核 1: 提现中 2: 提现完成 3:取消提现 4: 提现失败 5: 审核未通过 */
    @Column({
        name: 'status',
        default: '0',
        comment: '提现状态 0: 等待审核 1: 提现中 2: 提现完成 3:取消提现 4: 提现失败 5: 审核未通过',
        type: 'char',
        length: 1
    })
    @Excel({
        name: '提现状态'
    })
    @IsString()
    status: string

    /* 提现总金额 */
    @Column({
        name: 'total_price',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '提现总金额'
    })
    @Excel({
        name: '提现总金额'
    })
    @Type()
    @IsNumber()
    totalPrice: number

    /* 提现手续费 */
    @Column({
        name: 'total_fee',
        type: "decimal", precision: 10, scale: 2, default: 0.00,
        comment: '提现手续费'
    })
    @Excel({
        name: '提现手续费'
    })
    @Type()
    @IsNumber()
    totalFee: number

    /* 提现到账 */
    @Column({
        name: 'real_price',
        type: "decimal", precision: 10, scale: 2, default: 0.00,
        comment: '实际金额'
    })
    @Excel({
        name: '实际金额'
    })
    @Type()
    @IsNumber()
    realPrice: number

    // /* 提现数量 */
    // @Column({
    //     name: 'count',
    //     default: '1',
    //     comment: '订单数量'
    // })
    // @IsOptional()
    // @Type()
    // @IsNumber()
    // count?: number

    @Column({
        name: 'order_no',
        default: '',
        comment: '来自支付平台的 确认订单后，汇付宝单据号',
        length: 50
    })
    @IsString()
    orderNo?: string

    @Column({
        name: 'sign_no',
        default: '',
        comment: '来自支付平台的 确认订单后，汇付宝单据号',
        length: 50
    })
    @IsString()
    signNo?: string

    @Column({
        name: 'bankcard_id',
        comment: '关联的银行卡'
    })
    @IsOptional()
    @Type()
    @Type()
    @IsNumber()
    bankcardId?: number

    @Column({
        name: 'card_no',
        default: '',
        comment: '卡号',
        length: 50
    })
    @Excel({
        name: '卡号'
    })
    @IsString()
    cardNo?: string

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
    @IsOptional()
    @Type()
    @IsNumber()
    userId?: number

    @ApiHideProperty()
    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user?: User

    @ApiHideProperty()
    @IsOptional()
    @OneToMany(() => WithdrawFlow, withdrawFlow => withdrawFlow.withdraw)
    withdrawFlows?: WithdrawFlow[]

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
