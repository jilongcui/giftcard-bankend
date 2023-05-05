import { User } from "@app/modules/system/user/entities/user.entity"
import { ApiHideProperty } from "@nestjs/swagger"
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator"
import {
    Entity,
    Tree,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent,
    PrimaryColumn,
    JoinColumn,
    OneToOne,
    Column,
    CreateDateColumn,
} from "typeorm"

@Entity()
@Tree("materialized-path",)
export class InviteUser {
    @PrimaryColumn()
    id: number

    @IsOptional()
    @Column({
        default: null
    })
    parentId?: number

    @Column({
        name: 'user_name',
    })
    nickName: string

    @Column({
        name: 'is_opencard',
        default: false
    })
    @IsBoolean()
    isOpenCard: boolean

    @Column({
        name: 'is_exchange_usdt',
        default: false
    })
    @IsBoolean()
    isExchangeUsdt: boolean

    @Column({
        name: 'avatar',
    })
    avatar: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: Date

    @OneToOne(type => User)
    @IsOptional()
    @JoinColumn({
        name: 'id',
    })
    user: User

    @TreeChildren()
    children: InviteUser[]

    @TreeParent()
    parent: InviteUser
}