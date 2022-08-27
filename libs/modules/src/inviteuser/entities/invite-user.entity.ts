import { IsOptional } from "class-validator"
import {
    Entity,
    Tree,
    Column,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent,
} from "typeorm"

@Entity()
@Tree("materialized-path")
export class InviteUser {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'user_id',
    })
    userId: number

    @Column({
        name: 'user_name',
    })
    userName: string

    // @Column({
    //     name: 'user_profile',
    //     default: '',
    //     type: 'simple-json'
    // })
    // @IsOptional()
    // userProfile?: JSON

    @TreeChildren()
    children: InviteUser[]

    @TreeParent()
    parent: InviteUser
}