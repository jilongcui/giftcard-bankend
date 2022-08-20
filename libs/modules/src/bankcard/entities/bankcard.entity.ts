import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { Order } from "@app/modules/order/entities/order.entity";

@Entity()
export class Bankcard {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'card_no',
        length: 50,
        comment: '持卡人银行卡号'
    })
    @IsString()
    cardNo: string

    @Column({
        name: 'card_name',
        length: 50,
        comment: '持卡人姓名'
    })
    @IsString()
    cardName: string

    @Column({
        name: 'mobile',
        length: 11,
        comment: '持卡人预留手机号'
    })
    @IsString()
    mobile: string

    @Column({
        name: 'cert_no',
        length: 11,
        comment: '持卡人身份证号'
    })
    @IsString()
    certNo: string

    @Column({
        name: 'bank_name',
        length: 11,
        comment: '银行名称'
    })
    @IsString()
    bankName: string

    @Column({
        name: 'type',
        comment: '银行卡类型 0: 储蓄卡 1: 信用卡',
    })
    @IsOptional()
    @IsString()
    card_type?: number

    @Column({
        name: 'type',
        comment: '银行类型 ',
    })
    @IsOptional()
    @IsString()
    bankType?: number

    @Column({
        name: 'status',
        comment: '签约状态'
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
