import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Identity } from "@app/modules/identity/entities/identity.entity";
import { Type } from "class-transformer";
import { Kyc } from "@app/modules/kyc/entities/kyc.entity";
import { Cardinfo } from "@app/modules/cardinfo/entities/cardinfo.entity";

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
    @IsString()
    cardNo: string

    /* 持卡人银行卡Pin */
    @Column({
        name: 'pin_code',
        default: '',
        length: 50,
        comment: '持卡人Pin密码，以加密'
    })
    @IsOptional()
    @IsString()
    pinCode?: string


    /* 持卡人预留手机号 */
    @Column({
        name: 'mobile',
        length: 11,
        comment: '持卡人预留手机号'
    })
    @IsString()
    mobile: string

    /* 银行名称 */
    @Column({
        name: 'bank_name',
        length: 50,
        comment: '银行名称'
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

    /* 银行卡签约号 用于支付使用*/
    @Column({
        name: 'sign_no',
        default: '',
        comment: '银行卡签约号 不要展示，后台记录',
    })
    @IsOptional()
    @IsString()
    signNo?: string
    /* 签约状态 0: 未签约 1: 已经签约 2:签约失败 3: 已经鉴权 4: 鉴权失败 */
    @Column({
        name: 'status',
        default: '0',
        comment: '签约状态 0: 未签约 1: 已经签约 2:签约失败 3: 已经鉴权 4: 鉴权失败'
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
        name: 'identity_id',
        default: null,
        comment: '银行卡的实名'
    })
    @IsNumber()
    identityId: number

    @Column({
        name: 'bg_color',
        default: '#AB14AF,#7149CE',
        length: '20',
        comment: '银行卡背景'
    })
    @IsString()
    bgColor: string

    @ApiHideProperty()
    @IsOptional()
    @ManyToOne(() => Identity)
    @JoinColumn({
        name: 'identity_id',
    })
    identity?: Identity

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
        comment: '订单所属用户'
    })
    @Type()
    @IsNumber()
    userId: number

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
    @Type()
    cardinfoId: number

    @ApiHideProperty()
    @IsOptional()
    @ManyToOne(() => Cardinfo)
    @JoinColumn({
        name: 'cardinfo_id',
    })
    cardinfo?: Cardinfo

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
