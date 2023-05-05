import { ApiHideProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum ProfitType {
    'OpenCardFee' = 'OpenCardFee',
    'WithdrawToCardFee' = 'WithdrawToCardFee',
    'ExchangeFee' = 'ExchangeFee',
    'InnerTransferFee' = 'InnerTransferFee',
    'PromoteVipFee' = 'PromoteVipFee',
    'CardMonthFee' = 'CardMonthFee',
}

export enum ProfitSubType {
    'USDT' = 'USDT',
    'HKD' = 'HKD',
}

@Entity()
export class ProfitRecord {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 类型 */
    @Column({
        name: 'type',
        type: 'enum',
        enum: ProfitType,
        comment: '收益类型'
    })
    @IsEnum(ProfitType)
    type: ProfitType

    /* 交易渠道 */
    @Column({
        name: 'subtype',
        type: 'enum',
        enum: ProfitSubType,
        default: ProfitSubType.USDT,
        comment: '交易渠道'
    })
    @IsEnum(ProfitSubType)
    subtype?: ProfitSubType

    @Column({
        name: 'user_id',
        comment: 'user Id'
    })
    @IsOptional()
    @IsNumber()
    userId: number

    @Column({
        name: 'content',
        type: 'varchar',
        length: '150',
        default: '',
        comment: '内容描述'
    })
    @IsOptional()
    @IsString()
    content?: string

    @Column({
        name: 'amount',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '金额'
    })
    @IsOptional()
    @IsNumber()
    amount: number

    @Column({
        name: 'fee',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '费用'
    })
    @IsOptional()
    @IsNumber()
    fee?: number

    @Column({
        name: 'txid',
        comment: '交易凭证txid'
    })
    @IsOptional()
    @IsString()
    txid: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
