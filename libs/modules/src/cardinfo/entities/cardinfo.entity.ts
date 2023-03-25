import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsObject, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { CardInfoDetail } from "./cardinfo-detail.entity";

@Entity()
export class Cardinfo {

    @PrimaryGeneratedColumn()
    id: number


    @Column({
        length: 10,
    })
    name: string 

    /* 卡片资料 */
    @Column( 'simple-json',{
        name: 'info',
        comment: '认证资料'
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
