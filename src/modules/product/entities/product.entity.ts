import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { Activity } from "src/modules/activity/entities/activity.entity";
import { Order } from "src/modules/order/entities/order.entity";
import { User } from "src/modules/system/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'prod_id'
    })
    prodId: number

    @Column({
        name: 'prod_name',
        comment: '名称',
        unique: true
    })
    @IsString()
    prodName: string

    @Column({
        name: 'prod_supply',
        comment: '总供应量',
    })
    @IsNumber()
    prodSupply: number

    @Column({
        name: 'prod_current',
        comment: '当前释放量',
    })
    @IsNumber()
    prodCurrent: number

    @Column({
        name: 'prod_desc',
        comment: '描述',
        type: 'longtext'
    })
    @IsString()
    prodDesc: string

    @IsArray()
    @Column({
        name: 'images',
        comment: '图片',
        type: 'simple-array',
    })
    images: string[]

    @ManyToOne(type => User)
    @JoinColumn({
        name: 'auth_id',
    })
    auth: User

    @Column({
        name: 'status',
        comment: '状态(0:下架 1: 上架)',
        type: 'char',
        default: '0'
    })
    status: string

    @ApiHideProperty()
    @ManyToOne(() => Activity, activity => activity.products)
    activity: Activity

    @IsOptional()
    @ManyToOne(() => Order, order => order.products)
    orders?: Order[]
}
