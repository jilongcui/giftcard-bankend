import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { User } from "src/modules/system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Collection } from "./collection.entity";

@Entity()
export class Asset {
    @PrimaryGeneratedColumn({
        name: 'id'
    })
    @IsNumber()
    id: number

    @Column({
        name: 'asset_no',
        comment: '藏品编号'
    })
    @IsNumber()
    assetNo: number

    @Column({
        name: 'price',
        comment: '当前价值(单位人民币)'
    })
    @IsNumber()
    price: number

    @Column({
        name: 'user_id',
        comment: '用户id'
    })
    @IsNumber()
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
    @IsNumber()
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
    @IsString()
    status: string

    /* 创建时间 */
    @ApiHideProperty()
    @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
    createTime: number

    /* 更新时间 */
    @ApiHideProperty()
    @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
    @ApiHideProperty()
    updateTime: Date
}
