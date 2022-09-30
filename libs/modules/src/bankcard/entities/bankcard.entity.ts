import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Identity } from "@app/modules/identity/entities/identity.entity";

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

    /* 实名认证的Id */
    @Column({
        name: 'identity_id',
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
    @ManyToOne(() => Identity)
    @JoinColumn({
        name: 'identity_id',
    })
    identity: Identity

    @Column({
        name: 'user_id',
        comment: '订单所属用户'
    })
    @IsNumber()
    userId: number

    @ApiHideProperty()
    @ManyToOne(() => User, user => user.bankcards)
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
}
