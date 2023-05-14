import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MemberInfo } from "./cardinfo-detail.entity";
import { Type } from "class-transformer";

@Entity()
export class Cardinfo {

    @PrimaryGeneratedColumn()
    id: number

    /* 卡的名称 */
    @Column({
        default: 1,
    })
    index: number // 0, 1, 2, 3

    /* 卡的名称 */
    @Column({
        length: 50,
    })
    name: string // VISA MASTER

    /* 开卡费用 */
    @Column({
        name: 'open_fee',
        default: '0'
    })
    @Type()
    @IsNumber()
    openFee: number // 开卡费用

    /* 卡片内容 */
    @Column({
        name: 'image',
        length: 150,
    })
    @IsOptional()
    @IsString()
    image?: string

    /* 卡片的会员资料 */
    @Column( 'simple-json',{
        name: 'info',
        comment: '卡的资料'
    })
    @IsObject()
    info: MemberInfo
    
    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
