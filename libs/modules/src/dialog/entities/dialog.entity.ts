import { Activity } from "@app/modules/activity/entities/activity.entity"
import { Excel } from "@app/modules/common/excel/excel.decorator"
import { Nano } from "@app/modules/nano/entities/nano.entity"
import { Payment } from "@app/modules/payment/entities/payment.entity"
import { User } from "@app/modules/system/user/entities/user.entity"
import { ApiHideProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsString, IsOptional } from "class-validator"
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, ManyToOne, JoinColumn, ManyToMany, Collection, OneToMany } from "typeorm"

@Entity()
export class Dialog {
    @PrimaryGeneratedColumn()
    @IsNumber()
    @Excel({
        name: '对话ID'
    })
    id: number

    /* 对话类型 0: "Normal", 1: "工作" 2: "学习" 3: 娱乐 4: "金融" 5: "健身" 6: "科技" */
    @Column({
        name: 'type',
        comment: '对话类型 0: "普通", 1: "工作" 2: "学习" 3: 娱乐 4: "金融" 5: "健身" 6: "科技"',
        type: 'char',
        length: 1,
        default: '0'
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '对话类型',
        readConverterExp: {
            0: "普通", 1: "工作", 2: "学习", 3: "娱乐", 4: "金融", 5: "健身", 6: "科技"
        }
    })
    type?: string

    /* 订单总金额 */
    @Column({
        name: 'total_nano',
        default: 0,
        comment: '总记录'
    })
    @IsNumber()
    @Excel({
        name: '总记录',
    })
    totalNano?: number

    /* 总浏览 */
    @Column({
        name: 'total_view',
        default: 0,
        comment: '总浏览'
    })
    @IsNumber()
    @Excel({
        name: '总浏览',
    })
    totalView?: number

    @ApiHideProperty()
    @Column({
        name: 'total_time',
        default: 0,
        comment: '总时间'
    })
    @IsNumber()
    @Excel({
        name: '总时间',
    })
    totalTime?: number

    /* 对话状态 0: 已关闭 1: 聊天中 2: 引擎故障'*/
    @Column({
        name: 'status',
        comment: '对话状态 0: 已关闭 1: 聊天中 2: 引擎故障',
        type: 'char',
        default: '1',
        length: 1
    })
    @IsString()
    @Excel({
        name: '对话状态',
        readConverterExp: {
            0: "已关闭", 1: "聊天中", 2: "引擎故障",
        }
    })
    status?: string

    /* 订单图片 */
    @Column({
        name: 'image',
        default: null,
        comment: '订单图片'
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '订单图片',
    })
    image?: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    @Excel({
        name: '创建时间',
    })
    createTime: number

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'last_time',
        type: 'datetime',
        comment: '最后使用时间'
    })
    @Excel({
        name: '最后使用时间',
    })
    lastTime: Date

    /* 引擎ID */
    @Column({
        name: 'engine_id',
        default: 0,
        comment: '引擎ID'
    })
    @IsNumber()
    @Excel({
        name: '引擎ID',
    })
    engineId?: number

    // @ApiHideProperty()
    // @ManyToOne(() => Engine, engine => engine.orders)
    // @JoinColumn({
    //     name: 'engine_id',
    // })
    // user: Engine

    /* 应用模型ID */
    @Column({
        name: 'appmodel_id',
        default: '0',
        comment: '应用模型ID'
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '应用模型ID',
    })
    appmodelId?: string

    /* 所属用户 */
    @Column({
        name: 'user_id',
        comment: '用户ID'
    })
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

    @ApiHideProperty()
    @IsOptional()
    @OneToMany(() => Nano, nano => nano.dialog)
    nanos?: Nano[]
}
