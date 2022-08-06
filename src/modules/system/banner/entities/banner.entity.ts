import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Banner {
    @PrimaryGeneratedColumn()
    id: number

    /* 描述 */
    @Column({
        name: 'desc',
        comment: 'Banner描述'
    })
    @IsString()
    desc: string

    /* 展示位置 */
    @Column({
        name: 'position',
        comment: 'Banner位置 home: 首页 market:市场首页',
        type: 'varchar',
        length: 10
    })
    @IsString()
    position: string

    /* 尺寸比例 */
    @Column({
        name: 'scale',
        comment: 'Banner大小, small, middle, large, huge',
        type: 'varchar',
        length: 10
    })
    @IsString()
    scale: string

    /* 图片地址 */
    @Column({
        name: 'image',
        comment: '图片',
        type: 'varchar',
        length: 100,
    })
    @IsString()
    image: string

    /* 显示顺序 */
    @Column({
        name: "order_num",
        comment: '显示顺序',
    })
    @Type(() => Number)
    @IsNumber()
    orderNum: number

    /* 链接地址 */
    @Column({
        name: 'url',
        comment: '链接地址',
        length: '150'
    })
    @IsString()
    url?: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
