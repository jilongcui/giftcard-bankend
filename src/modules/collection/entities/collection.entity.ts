import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { Activity } from "src/modules/activity/entities/activity.entity";
import { Contract } from "src/modules/contract/entities/contract.entity";
import { Order } from "src/modules/order/entities/order.entity";
import { User } from "src/modules/system/user/entities/user.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Collection extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'id'
    })
    @Type(() => Number)
    @IsNumber()
    id: number

    @Column({
        name: 'name',
        comment: '名称',
        unique: true
    })
    @IsString()
    name: string

    @Column({
        name: 'supply',
        comment: '总供应量',
    })
    @Type(() => Number)
    @IsNumber()
    supply: number

    @Column({
        name: 'current',
        comment: '当前释放量',
    })
    @Type(() => Number)
    @IsNumber()
    current: number

    @Column({
        name: 'desc',
        comment: '描述',
        type: 'longtext'
    })
    @IsString()
    desc: string

    @IsArray()
    @Column({
        name: 'images',
        comment: '图片',
        type: 'simple-array',
    })
    images: string[]

    @Column({
        name: 'author_id',
        comment: '作者id'
    })
    @Type(() => Number)
    @IsNumber()
    authorId: number

    @ApiHideProperty()
    @ManyToOne(type => User)
    @JoinColumn({
        name: 'author_id',
    })
    author: User

    /* 状态(0:下架 1: 上架) */
    @Column({
        name: 'status',
        comment: '状态(0:下架 1: 上架)',
        type: 'char',
        default: '0'
    })
    @IsString()
    status: string

    @Column({
        name: 'contract_id',
        comment: '关联合约id'
    })
    @Type(() => Number)
    @IsNumber()
    contractId: number

    @ApiHideProperty()
    @ManyToOne(() => Contract, contract => contract.collections)
    @JoinColumn({
        name: 'contract_id',
    })
    contract: Contract

    @ApiHideProperty()
    @ManyToOne(() => Activity, activity => activity.collections)
    activity: Activity

    @ApiHideProperty()
    @IsOptional()
    @ManyToMany(() => Order, order => order.collections)
    @JoinTable()
    orders?: Order[]
}
