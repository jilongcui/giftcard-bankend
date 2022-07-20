import { ApiHideProperty } from "@nestjs/swagger";
import { User } from "src/modules/system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Collection } from "./collection.entity";

@Entity()
export class Asset {
    @PrimaryGeneratedColumn({
        name: 'asset_id'
    })
    assetId: number

    @Column({
        name: 'value',
        comment: '当前价值(单位人民币)'
    })
    value: number

    @Column({
        name: 'user_id',
        comment: '用户id'
    })
    userId: number

    @ApiHideProperty()
    @ManyToOne(type => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @Column({
        name: 'collection_id',
        comment: '产品id'
    })
    collectionId: number

    @ApiHideProperty()
    @OneToOne(type => Collection)
    @JoinColumn({
        name: 'collection_id',
    })
    collection: Collection

    @Column({
        name: 'status',
        comment: '状态(0:下架 1: 上架)',
        type: 'char',
        default: '0'
    })
    status: string

    @ApiHideProperty()
    @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
    createTime: number
}
