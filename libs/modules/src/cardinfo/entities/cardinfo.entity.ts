import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsObject, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { CardInfoDetail } from "./cardinfo-detail.entity";

@Entity()
export class Cardinfo {

    @PrimaryGeneratedColumn()
    id: number


    /* 卡的名称 */
    @Column({
        length: 50,
    })
    name: string // VISA MASTER

    /* 卡片详细资料 类的种类及费率 */
    @Column( 'simple-json',{
        name: 'info',
        comment: '卡的资料'
    })
    @IsObject()
    info: CardInfoDetail
    
    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
