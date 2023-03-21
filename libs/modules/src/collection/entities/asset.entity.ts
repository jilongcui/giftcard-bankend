import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Collection } from "./collection.entity";
import { Order } from "@app/modules/order/entities/order.entity";

@Entity()
export class Asset {
    @PrimaryGeneratedColumn({
        name: 'id'
    })
    @Type()
    @IsNumber()
    id: number

    @Column({
        name: 'asset_no',
        unique: true,
        comment: '藏品编号'
    })
    @Type()
    @IsNumber()
    assetNo: number

    @Column({
        name: 'index',
        comment: '藏品索引'
    })
    @Type()
    @IsNumber()
    index: number

    @Column({
        name: 'price',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '当前价值(单位人民币)'
    })
    @Type()
    @IsNumber()
    price: number

    @Column({
        name: 'user_id',
        comment: '用户id'
    })
    @Type()
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
    @Type()
    @IsNumber()
    collectionId: number

    @ApiHideProperty()
    @ManyToOne(type => Collection)
    @JoinColumn({
        name: 'collection_id',
    })
    collection: Collection

    @Column({
        name: 'status',
        comment: '状态(0:下架 1: 上架 2:锁定)',
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
    updateTime: Date

    // @ApiHideProperty()
    // @IsOptional()
    // @OneToMany(() => Order, order => order.asset)
    // orders?: Order[]

    @BeforeInsert()
    private beforeInsert() {
        this.assetNo = this.randomTokenId();
    }

    private randomTokenId(): number {
        return Math.floor((Math.random() * 999999999) + 1000000000);
    }
}
