import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { Activity } from "src/modules/activity/entities/activity.entity";
import { Contract } from "src/modules/contract/entities/contract.entity";
import { Order } from "src/modules/order/entities/order.entity";
import { User } from "src/modules/system/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Collection extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'id'
    })
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
    @IsNumber()
    supply: number

    @Column({
        name: 'current',
        comment: '当前释放量',
    })
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
    authorId: number

    @ApiHideProperty()
    @ManyToOne(type => User)
    @JoinColumn({
        name: 'author_id',
    })
    author: User

    @Column({
        name: 'status',
        comment: '状态(0:下架 1: 上架)',
        type: 'char',
        default: '0'
    })
    status: string

    @Column({
        name: 'contract_id',
        comment: '关联合约id'
    })
    contractId: number

    @ManyToOne(() => Contract, contract => contract.collections)
    contract: Contract

    @ApiHideProperty()
    @ManyToOne(() => Activity, activity => activity.collections)
    activity: Activity

    @ApiHideProperty()
    @IsOptional()
    @ManyToOne(() => Order, order => order.collections)
    orders?: Order[]
}
