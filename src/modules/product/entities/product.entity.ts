import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

    // @Column({
    //     name: 'status',
    //     comment: '状态(0:正常 1: 下架了)'
    // })
    // status: string
}
