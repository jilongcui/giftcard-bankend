import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Identity } from "@app/modules/identity/entities/identity.entity";
import { Type } from "class-transformer";

@Entity()
export class Submitter {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 发行商手机号 */
    @Column({
        name: 'mobile',
        length: 11,
        comment: '发行商手机号'
    })
    @IsString()
    mobile: string

    /* 发行商名称 */
    @Column({
        name: 'merch_name',
        length: 50,
        comment: '发行商名称'
    })
    @IsString()
    merchName: string

    /* 藏品名称 */
    @Column({
        name: 'collection_name',
        length: 50,
        comment: '藏品名称'
    })
    @IsString()
    collectionName: string

    /* 藏品描述 */
    @Column({
        name: 'collection_desc',
        length: 250,
        comment: '藏品描述'
    })
    @IsString()
    collection_desc: string

    /* 订单图片 */
    @Column({
        name: 'image',
        comment: '藏品图片'
    })
    @IsString()
    image: string

    /* 状态 0： 未读 1:已读 */
    @Column({
        name: 'status',
        default: '0',
        comment: '状态 0： 未读 1:已读'
    })
    @IsString()
    status: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
