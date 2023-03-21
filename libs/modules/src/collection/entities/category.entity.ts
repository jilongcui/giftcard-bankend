import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { BaseEntity } from "@app/common/entities/base.entity";
import { User } from "../../system/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Collection } from "./collection.entity";

@Entity()
export class Category extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'category_id'
    })
    categoryId: number

    @Column({
        name: 'category_name',
        comment: '商品类别'
    })
    categoryName: string
}
