import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { User } from "src/modules/system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

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
        name: 'product_id',
        comment: '产品id'
    })
    productId: number

    @ApiHideProperty()
    @OneToOne(type => Product)
    @JoinColumn({
        name: 'product_id',
    })
    product: Product

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
