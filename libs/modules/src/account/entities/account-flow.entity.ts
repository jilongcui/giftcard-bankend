import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum AccountFlowType {
    'Recharge' = 'Recharge',
    'Withdraw' = 'Withdraw',
    'WithdrawRevert' = 'WithdrawRevert',
    'Transfer' = 'Transfer',
    'Exchange' = 'Exchange',
    'ExchangeBrokerage' = 'ExchangeBrokerage',
    'BankWithdraw' = 'BankWithdraw',
    'BankWithdrawRevert' = 'BankWithdrawRevert',
    'OpenCard' = 'OpenCard',
    'OpenCardRevert' = 'OpenCardRevert',
    'UpgradeCard' = 'UpgradeCard',
    'OpenCardBrokerage' = 'OpenCardBrokerage',
    'PromotionAgent' = 'PromotionAgent',
    'PromotionAgentRevert' = 'PromotionAgentRevert',
}

export enum AccountFlowTypeDesc {
    'Recharge' = '钱包充值',
    'Withdraw' = '钱包提币',
    'WithdrawRevert' = '钱包提币提币退回',
    'Transfer' = '钱包转账',
    'Exchange' = '钱包兑换',
    'BankWithdraw' = '充值到银行卡',
    'BankWithdrawRevert' = '充值到银行卡退回',
    'OpenCard' = '开卡费',
    'OpenCardRevert' = '开卡费退回',
    'UpgradeCard' = '升级卡费',
    'OpenCardBrokerage' = '开卡返佣',
    'PromotionAgent' = '推广大使费用',
    'PromotionAgentRevert' = '推广大使费用退回',
}

export enum AccountFlowDirection {
    'In' = 'In',
    'Out' = 'Out',
}

@Entity('account_flow')
export class AccountFlow {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'type',
        type: 'enum',
        enum: AccountFlowType,
        comment: '类型 0: Recharge 1:Withdraw 2: First-Buy 3: Market-Outcome 4: Market-Income 5: Transfer '
    })
    @IsEnum(AccountFlowType)
    type: AccountFlowType

    @Column({
        name: 'direction',
        type: 'enum',
        enum: AccountFlowDirection,
        comment: '资金转移方向 0: Out 1: In'
    })
    @IsEnum(AccountFlowDirection)
    direction: AccountFlowDirection

    @Column({
        name: 'currency_id',
        comment: '代币id'
    })
    @IsNumber()
    currencyId: number

    /* 代币name */
    @Column({
        name: 'currency_name',
        comment: '代币name'
    })
    @IsString()
    currencyName: string

    @Column({
        name: 'amount',
        type: "decimal", precision: 10, scale: 4, default: 0,
        comment: '金额'
    })
    @IsOptional()
    @IsNumber()
    amount: number

    @Column({
        name: 'balance',
        type: "decimal", precision: 10, scale: 4, default: 0,
        comment: '总金额'
    })
    @IsOptional()
    @IsNumber()
    balance: number

    @Column({
        name: 'remark',
        type: 'varchar',
        length: '100',
        default: '',
        comment: '标注'
    })
    @IsOptional()
    @IsString()
    remark?: string

    /* 操作用户Id */
    @Column({
        name: 'user_id',
        comment: '操作用户'
    })
    @IsNumber()
    userId: number

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ApiHideProperty()
    @UpdateDateColumn({
        name: 'update_time',
        comment: '更新时间'
    })
    updateTime: number
}
