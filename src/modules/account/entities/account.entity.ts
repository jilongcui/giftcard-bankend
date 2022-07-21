import { ApiHideProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"
import { Currency } from "src/modules/currency/entities/currency.entity"
import { User } from "src/modules/system/user/entities/user.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'usable',
        comment: '可用余额',
        default: 0
    })
    @IsNumber()
    usable: number

    @Column({
        name: 'freeze',
        comment: '冻结余额',
        default: 0
    })
    @IsNumber()
    freeze: number

    @Column({
        name: 'status',
        comment: '账户状态 0: 未认证 1: 正常 2:冻结',
        type: 'char',
        length: 1
    })
    @IsString()
    status: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    // @IsNumber()
    createTime: number

    @ApiHideProperty()
    @ManyToOne(() => User)
    user: User

    @ApiHideProperty()
    @ManyToOne(() => Currency)
    @JoinColumn({
        name: 'currency_id',
    })
    currency: Currency
}
