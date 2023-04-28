import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { Cardinfo } from "@app/modules/cardinfo/entities/cardinfo.entity";
import { User } from "@app/modules/system/user/entities/user.entity";

@Entity()
export class Giftcard {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 持卡人银行卡号 */
    @Column({
        name: 'card_no',
        length: 50,
        comment: '持卡人银行卡号'
    })
    @IsOptional()
    @IsString()
    cardNo?: string

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

    /* 银行卡价格 */
    @Column({
        name: 'price',
        default: 0.00,
        type: "decimal", precision: 10, scale: 2,
        comment: '银行卡价格'
    })
    @IsNumber()
    price: number

    /* 运费HKD */
    @Column({
        name: 'shipfee',
        default: 0.00,
        type: "decimal", precision: 10, scale: 2,
        comment: '运费HKD'
    })
    @IsNumber()
    shipfee: number

    /* 手续费HKD */
    @Column({
        name: 'tradefee',
        default: 0.00,
        type: "decimal", precision: 10, scale: 2,
        comment: '手续费HKD'
    })
    @IsNumber()
    tradefee: number

    /* 银行卡状态 0: 未激活 1: 已经激活 2: 已冻结 3: 已注销 */
    @Column({
        name: 'status',
        default: '0',
        comment: '银行卡状态 0: 未激活 1: 已经激活 2: 已冻结 3: 已注销'
    })
    @IsString()
    status: string

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

    // @Column({
    //     name: 'cardinfo_id',
    //     default: null,
    //     comment: '银行卡详情'
    // })
    // @Type()
    // @IsNumber()
    // cardinfoId: number

    // @ApiHideProperty()
    // @IsOptional()
    // @ManyToOne(() => Cardinfo)
    // @JoinColumn({
    //     name: 'cardinfo_id',
    // })
    // cardinfo?: Cardinfo

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
