import { ApiHideProperty } from "@nestjs/swagger"
import { IsOptional } from "class-validator"
import { Currency } from "src/modules/currency/entities/currency.entity"
import { User } from "src/modules/system/user/entities/user.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'usable',
        comment: '可用余额',
        default: 0
    })
    usable: number

    @Column({
        name: 'freeze',
        comment: '冻结余额',
        default: 0
    })
    freeze: number

    @Column({
        name: 'status',
        comment: '账户状态 0: 未认证 1: 正常 2:冻结',
        type: 'char',
        length: 1
    })
    status: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ManyToOne(() => User)
    user: User

    @ManyToOne(() => Currency)
    @JoinColumn({
        name: 'currency_id',
    })
    currency: Currency
}
