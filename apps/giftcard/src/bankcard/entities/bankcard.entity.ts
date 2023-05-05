import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { Kyc } from "@app/modules/kyc/entities/kyc.entity";
import { Cardinfo } from "@app/modules/cardinfo/entities/cardinfo.entity";
import { User } from "@app/modules/system/user/entities/user.entity";
import { Order } from "../../order/entities/order.entity";
import { Excel } from "@app/modules/common/excel/excel.decorator";

@Entity()
export class Bankcard {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 持卡人银行卡号 */
    @Column({
        name: 'card_no',
        length: 50,
        comment: '持卡人银行卡号'
    })
    @Excel({
        name: '银行卡号'
    })
    @IsString()
    cardNo: string

    /* 持卡人银行卡Pin */
    @Column({
        name: 'pin_code',
        default: null,
        length: 50,
        comment: '持卡人Pin密码，需加密'
    })
    @Excel({
        name: 'Pin密码'
    })
    @IsOptional()
    @IsString()
    pinCode?: string


    // /* 持卡人预留手机号 */
    // @Column({
    //     name: 'mobile',
    //     length: 15,
    //     comment: '持卡人预留手机号'
    // })
    // @IsOptional()
    // @IsString()
    // mobile?: string

    /* 银行名称 */
    @Column({
        name: 'bank_name',
        length: 50,
        comment: '银行名称'
    })
    @Excel({
        name: '银行名称'
    })
    @IsString()
    bankName: string

    /* 银行卡类型 0: 储蓄卡 1: 信用卡 */
    @Column({
        name: 'card_type',
        default: '0',
        comment: '银行卡类型 0: 储蓄卡 1: 信用卡',
    })
    @IsOptional()
    @IsString()
    cardType?: string

    /* 银行类型: 只用于展示图标用途 */
    @Column({
        name: 'bank_type',
        comment: '银行类型: 只用于展示图标用途',
        length: '6'
    })
    @IsOptional()
    @IsString()
    bankType?: string

    /* 银行CVV Code */
    @Column({
        name: 'bank_cvvcode',
        comment: '银行卡CVV',
        length: '10'
    })
    // @Excel({
    //     name: '银行卡CVV'
    // })
    @IsOptional()
    @IsString()
    bankCVVCode?: string

    /* 银行类型: 只用于展示图标用途 */
    @Column({
        name: 'valid_through',
        comment: '银行卡有效期',
        length: '12'
    })
    // @Excel({
    //     name: '有效期',
    //     // dateFormat: 'YYYY-MM-DD'
    // })
    @IsOptional()
    @IsString()
    validThrough?: string

    /* 签约事务编号 */
    @Column({
        name: 'sign_trade_no',
        default: '',
        comment: '银行卡验证签名编号，后台记录',
    })
    @IsOptional()
    @IsString()
    signTradeNo?: string

    /* 签约事务编号 */
    @Column({
        name: 'sign_trade_time',
        default: '',
        comment: '银行卡验证签名时间，后台记录',
    })
    @IsOptional()
    @IsString()
    signTradeTime?: string

    /* 银行卡状态 0: 未激活 1: 已经激活 2: 已锁定 3: 已注销 */
    @Column({
        name: 'status',
        default: '0',
        comment: '银行卡状态 0: 未激活 1: 已经激活 2: 已锁定 3: 已注销'
    })
    @IsString()
    status: string

    /* 银行卡余额 */
    @Column({
        name: 'balance',
        default: 0.00,
        type: "decimal", precision: 10, scale: 2,
        comment: '银行卡余额'
    })
    @IsNumber()
    balance: number

    /* 实名认证的Id */
    @Column({
        name: 'kyc_id',
        default: null,
        comment: '银行卡的KYC认证'
    })
    @IsNumber()
    kycId: number

    @ApiHideProperty()
    @IsOptional()
    @ManyToOne(() => Kyc)
    @JoinColumn({
        name: 'kyc_id',
    })
    kyc?: Kyc

    @Column({
        name: 'user_id',
        default: null,
        comment: '订单所属用户'
    })
    @Type()
    @IsNumber()
    userId?: number

    @ApiHideProperty()
    @ManyToOne(() => User, user => user.bankcards)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @Column({
        name: 'cardinfo_id',
        default: null,
        comment: '银行卡详情'
    })
    // @Excel({
    //     name: '银行卡详情ID'
    // })
    @Type()
    @IsNumber()
    cardinfoId: number

    @ApiHideProperty()
    @IsOptional()
    @ManyToOne(() => Cardinfo)
    @JoinColumn({
        name: 'cardinfo_id',
    })
    cardinfo?: Cardinfo

    @ApiHideProperty()
    @OneToOne(() => Order)
    @IsOptional()
    @JoinColumn({
        name: 'order_id',
    })
    order?: Order
    
    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
