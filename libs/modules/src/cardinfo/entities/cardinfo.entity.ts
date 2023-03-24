import { Excel } from "@app/modules/common/excel/excel.decorator";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsObject, IsString } from "class-validator";
import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { CardInfoDto } from "../dto/create-cardinfo.dto";

export class Cardinfo {

    @PrimaryGeneratedColumn()
    id: number


    @Column({
        type: 'string',
        length: 10,
    })
    name: string 

    /* 卡片资料 */
    @Column( 'simple-json',{
        name: 'info',
        comment: '认证资料'
    })
    @IsObject()
    info: CardInfoDto
    
    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
