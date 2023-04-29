import { Cardinfo } from "@app/modules/cardinfo/entities/cardinfo.entity"
import { Kyc } from "@app/modules/kyc/entities/kyc.entity"
import { User } from "@app/modules/system/user/entities/user.entity"
import { ApiHideProperty } from "@nestjs/swagger"
import { Bankcard } from "apps/giftcard/src/bankcard/entities/bankcard.entity"
import { Type } from "class-transformer"
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator"
import { PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, CreateDateColumn, Entity } from "typeorm"

/* 0: 开始申请 1: 已绑定KYC资料 2: KYC认证通过 3:已获得一张卡 4: KYC审核失败 */
export enum ApplyCardStatus {
    Start= 0, // 开始申领
    ApplySuccess = 1,
    KycFailed = 2
}

@Entity()
export class ApplyCard {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 实名认证的Id */
    @Column({
        name: 'kyc_id',
        default: null,
        comment: '银行卡的KYC认证'
    })
    @IsNumber()
    kycId: number

    @ApiHideProperty()
    @IsOptional()
    @ManyToOne(() => Kyc)
    @JoinColumn({
        name: 'kyc_id',
    })
    kyc?: Kyc
    
    @Column({
        name: 'cardinfo_id',
        default: null,
        comment: '银行卡详情'
    })
    @Type()
    cardinfoId: number

    @ApiHideProperty()
    @IsOptional()
    @ManyToOne(() => Cardinfo)
    @JoinColumn({
        name: 'cardinfo_id',
    })
    cardinfo?: Cardinfo

    @Column({
        name: 'bankcard_id',
        default: null,
        comment: '关联的银行卡'
    })
    @IsOptional()
    @IsNumber()
    bankcardId?: number

    /* 关联的银行卡 */
    @ApiHideProperty()
    @ManyToOne(() => Bankcard)
    @JoinColumn({
        name: 'bankcard_id',
    })
    bankcard?: Bankcard

    /* 申请状态 0: 开始申请 1: 申请成功 2: 申请失败 */
    @Column({
        name: 'status',
        default: 0,
        comment: '申请状态 0: 开始申请 1: 申请成功 2: 申请失败'
    })
    @IsEnum(ApplyCardStatus)
    status: ApplyCardStatus
    
    @Column({
        name: 'user_id',
        comment: '订单所属用户'
    })
    @Type()
    @IsNumber()
    userId: number

    @ApiHideProperty()
    @ManyToOne(() => User, user => user.bankcards)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
