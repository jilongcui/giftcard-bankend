import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { BaseEntity } from "src/common/entities/base.entity";
import { Excel } from "src/modules/common/excel/excel.decorator";
import { ExcelTypeEnum } from "src/modules/common/excel/excel.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('address_eth')
export class Address {
    @PrimaryGeneratedColumn({
        name: 'id',
        comment: '地址id'
    })
    @Type()
    @IsNumber()
    id: number

    // @Column({
    //     name: 'notice_title',
    //     comment: '公告标题',
    //     length: 50,
    // })
    // @IsString()
    // noticeTitle: string

    @Column({
        name: 'user_id',
        comment: '用户ID',
    })
    @IsNumber()
    userId: number

    @Column({
        name: 'app_id',
        comment: '用户ID',
    })
    @IsNumber()
    appId: number

    @Column({
        name: 'address',
        comment: '地址',
        length: 64
    })
    @Type()
    @IsString()
    address: string

    @Column({
        name: 'private_key',
        comment: '私钥',
        length: 512
    })
    @IsString()
    privateKey: string

    // @Column({
    //     name: 'type',
    //     comment: '公告类型（1通知 2公告）',
    //     type: 'char',
    //     length: 1
    // })
    @IsString()
    addressType: string

    @Column({
        name: 'state',
        comment: '公告状态（0正常 1关闭）',
        type: 'char',
        default: '1',
        length: 1
    })
    @IsNumber()
    status: number

    /* 创建时间 */
    @Column({ name: 'createtime', comment: '创建时间' })
    // @Excel({
    //     name: '创建时间',
    //     type: ExcelTypeEnum.EXPORT,
    //     dateFormat: 'YYYY-MM-DD HH:mm:ss',
    //     sort: 99
    // })
    createTime: Number
}