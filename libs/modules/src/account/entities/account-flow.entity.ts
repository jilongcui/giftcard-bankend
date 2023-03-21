import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class AccountFlow {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 类型 0: Recharge 1:Withdraw 2: First-Buy 3: Market-Buy 4: Market-Sell 5: Transfer */
    @Column({
        name: 'type',
        type: 'char',
        comment: '类型 0: Recharge 1:Withdraw 2: First-Buy 3: Market-Outcome 4: Market-Income 5: Transfer '
    })
    @IsString()
    type: string

    /* 资金转移方向 0: Out 1: In */
    @Column({
        name: 'type',
        type: 'char',
        comment: '资金转移方向 0: Out 1: In'
    })
    @IsString()
    direction: string

    @Column({
        name: 'amount',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '金额'
    })
    @IsOptional()
    @IsNumber()
    amount: number

    @Column({
        name: 'amount',
        type: "decimal", precision: 10, scale: 2, default: 0,
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
