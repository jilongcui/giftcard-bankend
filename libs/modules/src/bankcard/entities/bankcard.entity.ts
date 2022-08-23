import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    /* 持卡人姓名 */
    @Column({
        name: 'user_name',
        length: 50,
        comment: '持卡人姓名'
    })
    @IsString()
    userName: string

    /* 持卡人预留手机号 */
    @Column({
        name: 'mobile',
        length: 11,
        comment: '持卡人预留手机号'
    })
    @IsString()
    mobile: string

    /* 持卡人身份证号 */
    @Column({
        name: 'cert_no',
        length: 50,
        comment: '持卡人身份证号'
    })
    @IsString()
    certNo: string

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

    // @Column({
    //     name: 'bank_type',
    //     comment: '银行类型 ',
    // })
    // @IsOptional()
    // @IsString()
    // bankType?: string

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

    /* 银行卡签约号 */
    @Column({
        name: 'sign_no',
        default: '',
        comment: '银行卡签约号 不要展示，后台记录',
    })
    @IsOptional()
    @IsString()
    signNo?: string

    @Column({
        name: 'status',
        default: '0',
        comment: '签约状态 0: 未签约 1: 已经签约'
    })
    @IsString()
    status: string

    // @ApiHideProperty()
    // @OneToMany(() => Order, order => order.bankcard)
    // orders: Order[]

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
