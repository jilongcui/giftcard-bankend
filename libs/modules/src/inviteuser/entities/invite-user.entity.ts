import { User } from "@app/modules/system/user/entities/user.entity"
import { ApiHideProperty } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString } from "class-validator"
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

    @Column({
        name: 'user_name',
    })
    nickName: string

    @Column({
        name: 'card_number',
    })
    cardNumber: number

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