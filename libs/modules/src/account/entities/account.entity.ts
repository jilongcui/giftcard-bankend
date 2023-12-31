import { ApiHideProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"
import { Currency } from "../../currency/entities/currency.entity"
import { User } from "../../system/user/entities/user.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'usable',
        comment: '可用余额',
        type: "decimal", precision: 10, scale: 2,
        default: 0,
    })
    @IsNumber()
    usable: number

    @Column({
        name: 'freeze',
        comment: '冻结余额',
        type: "decimal", precision: 10, scale: 2,
        default: 0
    })
    @IsNumber()
    freeze: number

    @Column({
        name: 'status',
        comment: '账户状态 0: 未认证 1: 正常 2:冻结',
        default: '0',
        type: 'char',
        length: 1
    })
    @IsString()
    status: string

    @Column({
        name: 'user_id',
        comment: '用户id'
    })
    @IsNumber()
    userId: number


    @Column({
        name: 'currency_id',
        comment: '代币id'
    })
    @IsNumber()
    currencyId: number

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    // @IsNumber()
    createTime: number

    @ApiHideProperty()
    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ApiHideProperty()
    @ManyToOne(() => Currency)
    @JoinColumn({
        name: 'currency_id',
    })
    currency: Currency
}
