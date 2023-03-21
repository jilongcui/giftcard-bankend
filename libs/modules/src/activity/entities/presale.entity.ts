import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Activity } from "./activity.entity";

@Entity()
export class Presale {
    @PrimaryGeneratedColumn()
    id: number

    /* 优先购时间 */
    @Column({
        name: 'presale_time',
        type: 'datetime',
        comment: '优先购时间',
        default: null
    })
    @IsOptional()
    @IsString()
    presaleTime?: Date

    /* 优先购价格 */
    @Column({
        name: 'presale_price',
        comment: '预定价格'
    })
    @IsOptional()
    @IsNumber()
    presalePrice?: number

    // @Column({
    //     name: 'is_presale',
    //     comment: '是否需要预定 0: 1:需要',
    //     type: 'char',
    //     default: '0',
    //     length: 1
    // })
    // @IsString()
    // isPresale: string

    @ApiHideProperty()
    @IsOptional()
    @OneToOne(() => Activity)
    @JoinColumn({
        name: 'activity_id',
    })
    activity?: Activity
}
