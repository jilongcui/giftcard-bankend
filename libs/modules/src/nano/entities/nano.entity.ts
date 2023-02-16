import { Excel } from "@app/modules/common/excel/excel.decorator"
import { Dialog } from "@app/modules/dialog/entities/dialog.entity"
import { User } from "@app/modules/system/user/entities/user.entity"
import { ApiHideProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsString, IsOptional } from "class-validator"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToOne, JoinColumn, ManyToMany, Collection, OneToMany } from "typeorm"

@Entity()
export class Nano {
    @PrimaryGeneratedColumn()
    @IsNumber()
    @Excel({
        name: '小句ID'
    })
    id: number

    /* 小句内容 */
    @Column({
        name: 'content',
        comment: '小句内容'
    })
    @IsString()
    @Excel({
        name: '小句内容'
    })
    content: string

    /* 小句类型 0: "发问", 1: "回答" */
    @Column({
        name: 'type',
        comment: '小句类型 0: "发问", 1: "回答"',
        type: 'char',
        length: 1,
        default: '0'
    })
    @IsString()
    @Excel({
        name: '对话类型',
        readConverterExp: {
            0: "发问", 1: "回答", 
        }
    })
    type: string

    /* 所属用户 */
    @Column({
        name: 'user_id',
        comment: '用户ID'
    })
    @Type()
    @IsNumber()
    @Excel({
        name: '用户ID',
    })
    userId: number

    @ApiHideProperty()
    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    /* 所属对话 */
    @Column({
        name: 'dialog_id',
        comment: '对话ID'
    })
    @Type()
    @IsNumber()
    @Excel({
        name: '对话ID',
    })
    dialogId: number

    @ApiHideProperty()
    @IsOptional()
    @ManyToOne(() => Dialog, dialog => dialog.nanos)
    @JoinColumn({
        name: 'dialog_id',
    })
    dialog?: Dialog
}
