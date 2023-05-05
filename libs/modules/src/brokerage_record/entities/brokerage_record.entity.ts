import { ApiHideProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum BrokerageType {
    'OpenCardBrokerage' = 'OpenCardBrokerage',
    'ExchangeBrokerage' = 'ExchangeBrokerage',
}

@Entity()
export class BrokerageRecord {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 类型 */
    @Column({
        name: 'type',
        type: 'enum',
        enum: BrokerageType,
        comment: '收益类型'
    })
    @IsEnum(BrokerageType)
    type: BrokerageType

    @Column({
        name: 'user_id',
        comment: 'user Id'
    })
    @IsOptional()
    @IsNumber()
    userId: number

    @Column({
        name: 'from_user_id',
        comment: 'from user Id'
    })
    @IsOptional()
    @IsNumber()
    fromUserId: number

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
        name: 'value',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '佣金'
    })
    @IsOptional()
    @IsNumber()
    value?: number

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
