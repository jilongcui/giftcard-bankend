import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Identity } from "@app/modules/identity/entities/identity.entity";
import { Type } from "class-transformer";

@Entity()
export class MemberInfo {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'index',
        comment: '会员索引'
    })
    @Type()
    @IsNumber()
    index: number

    /* 会员名称 */
    @Column({
        name: 'name',
        length: 50,
        comment: '会员名称'
    })
    @IsString()
    name: string

    @Column({
        name: 'days',
        comment: '会员天数'
    })
    @Type()
    @IsNumber()
    days: number

    /* 会员描述 */
    @Column({
        name: 'desc',
        length: 200,
        comment: '会员描述'
    })
    @IsString()
    desc: string

    @Column({
        name: 'price',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '当前价值(单位人民币)'
    })
    @Type()
    @IsNumber()
    price: number

    /* 会员等级 0: 普通会员 1: 超级会员 */
    @Column({
        name: 'level',
        default: '0',
        type: 'char',
        comment: '会员等级 0: 普通会员 1: 超级会员',
    })
    @IsOptional()
    @IsString()
    level?: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}

