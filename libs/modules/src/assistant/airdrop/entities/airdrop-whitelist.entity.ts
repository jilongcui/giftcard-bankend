import { Collection } from "@app/modules/collection/entities/collection.entity";
import { Excel } from "@app/modules/common/excel/excel.decorator";
import { ExcelTypeEnum } from "@app/modules/common/excel/excel.enum";
import { User } from "@app/modules/system/user/entities/user.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class AirdropWhitelist {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'collection_ids',
        comment: '空投的藏品集合'
    })
    @IsString()
    @Excel({
        name: '藏品ID'
    })
    collectionIds: string

    @Column({
        name: 'user_id',
        comment: '空投给的用户'
    })
    @IsNumber()
    @Excel({
        name: '用户ID'
    })
    userId: number

    @Column({
        name: 'user_name',
        comment: '空投用户名',
        default: '',
        length: 30
    })
    @Excel({
        name: '用户名'
    })
    @IsString()
    userName?: string

    @Column({
        name: 'count',
        default: 1,
        comment: '空投数量'
    })
    @Excel({
        name: '空投数量'
    })
    @IsNumber()
    count?: number

    /* 空投发送状态 0: 未发送 1:发送中 2:发送成功 3:发送失败 */
    @Column({
        name: 'status',
        comment: '空投发送状态 0: 未发送 1:发送中 2:发送成功 3:发送失败',
        type: 'char',
        default: '0',
        length: 1
    })
    @IsString()
    @Excel({
        type: ExcelTypeEnum.EXPORT,
        name: '发送状态',
        readConverterExp: {
            0: "未发送", 1: "发送中", 2: "发送成功", 3: "发送失败"
        }
    })
    status: string

    /* 领取方式 0: 直接发放，1:需要领取 */
    @Column({
        name: 'claim_type',
        comment: '领取方式 0: 直接发放，1:需要领取',
        type: 'char',
        default: '0',
        length: 1
    })
    @Excel({
        name: '发送类型',
        readConverterExp: {
            0: "直接发放", 1: "需要领取"
        }
    })
    claimType: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    @Excel({
        type: ExcelTypeEnum.EXPORT,
        name: '创建时间',
    })
    createTime: Date

    @ApiHideProperty()
    @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
    @Excel({
        type: ExcelTypeEnum.EXPORT,
        name: '更新时间',
    })
    updateTime: Date

    @ApiHideProperty()
    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    // @ApiHideProperty()
    // @ManyToOne(() => Collection)
    // @JoinColumn({
    //     name: 'collection_id',
    // })
    // collection: Collection
}

