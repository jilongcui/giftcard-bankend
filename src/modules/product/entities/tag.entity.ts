import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { User } from "src/modules/system/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class Tag {
    @PrimaryGeneratedColumn({
        name: 'tag_id'
    })
    tagId: number

    @Column({
        name: 'tag_name',
        comment: '标签名称'
    })
    tagName: string
}
