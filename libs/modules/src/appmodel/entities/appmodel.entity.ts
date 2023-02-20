import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { CompletionPresetDto } from "@app/modules/engine/dto/create-engine.dto";

@Entity()
export class Appmodel {
    @PrimaryGeneratedColumn()
    id: number

    /* 名称 */
    @Column({
        name: 'name',
        comment: '模型名称'
    })
    @IsString()
    name: string

    /* 描述 */
    @Column({
        name: 'desc',
        comment: '模型描述'
    })
    @IsString()
    desc: string

    /* 图片地址 */
    @Column({
        name: 'image',
        comment: '图片',
        type: 'varchar',
        length: 200,
    })
    @IsString()
    image: string

    /* 显示顺序 */
    @Column({
        name: "index",
        default: '1',
        comment: '显示顺序',
    })
    @Type(() => Number)
    @IsNumber()
    index: number

    /* 描述 */
    @Column( 'simple-json',{
        name: 'preset',
        comment: '模型预设置'
    })
    @IsObject()
    preset: CompletionPresetDto

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
