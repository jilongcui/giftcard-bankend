import { Excel } from "@app/modules/common/excel/excel.decorator"
import { ExcelTypeEnum } from "@app/modules/common/excel/excel.enum"
import { Kyc } from "@app/modules/kyc/entities/kyc.entity"
import { User } from "@app/modules/system/user/entities/user.entity"
import { ApiHideProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsString, IsOptional } from "class-validator"
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, JoinColumn, OneToMany, ManyToOne } from "typeorm"

@Entity()
export class PromotionAgent {
    @PrimaryGeneratedColumn()
    id: number

    /* 用户Id */
    @Column({
        name: 'user_id',
        comment: '用户ID'
    })
    @IsNumber()
    @Excel({
        name: '用户ID'
    })
    userId: number

    // /* 用户账号 */
    // @Column({
    //     name: 'user_name',
    //     comment: '用户账号',
    //     length: 30,
    // })
    // @IsString()
    // @Excel({
    //     name: '用户账号'
    // })
    // userName: string

    /* 国家 */
    @Column({
        comment: '国家',
        length: 20,
        default: '中国'
    })
    @IsString()
    country: string

    /* 城市 */
    @Column({
        comment: '城市',
        length: 150,
        default: null
    })
    @IsString()
    city: string

    /* 用户邮箱 */
    @Column({
        comment: '用户邮箱',
        length: 50,
        default: null
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '用户邮箱'
    })
    email?: string

    /* Telegram */
    @Column({
        comment: 'Telegram',
        length: 20,
        default: null
    })
    @IsString()
    telegram: string

    // /* 手机号码 */
    // @Column({
    //     comment: '手机号码',
    //     length: 11,
    //     default: null
    // })
    // @IsOptional()
    // @IsString()
    // @Excel({
    //     name: '手机号码'
    // })
    // phonenumber?: string

    /* 个人介绍 */
    @Column({
        comment: '个人介绍',
        length: 100,
        default: ''
    })
    @IsOptional()
    @IsString()
    introduction?: string

    /* 个人优势 */
    @Column({
        comment: '个人优势',
        length: 200,
        default: ''
    })
    @IsOptional()
    @IsString()
    advantage?: string

    /* 状态（0待付款 1待审核 2审核成功 3审核失败）*/
    @Column({
        comment: '帐号状态（0待付款 1待审核 2审核成功 3审核失败）',
        type: 'char',
        length: 1,
        default: '0'
    })
    @IsString()
    @Excel({
        name: '状态',
        dictType: 'sys_normal_disable'
    })
    status: string

    /* 实名认证的Id */
    @Column({
        name: 'kyc_id',
        default: null,
        comment: '银行卡的KYC认证'
    })
    @IsOptional()
    @IsNumber()
    kycId?: number

    // @ApiHideProperty()
    // @OneToOne(() => Kyc)
    // kyc?: Kyc
    
    @ApiHideProperty()
    @OneToOne(() => User)
    @IsOptional()
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    @Excel({
        name: '创建时间',
    })
    createTime: number
}