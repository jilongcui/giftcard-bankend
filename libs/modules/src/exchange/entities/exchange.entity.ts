import { Currency } from "@app/modules/currency/entities/currency.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Exchange {
    @PrimaryGeneratedColumn({
        name: 'id',
        comment: '主ID',
    })
    @IsNumber()
    id: number;

    @Column({
        name: 'from_currency_id',
        comment: '从代币',
    })
    @IsNumber()
    fromCurrencyId: number;

    @ApiHideProperty()
    @ManyToOne(() => Currency)
    @JoinColumn({
        name: 'from_currency_id',
    })
    fromCurrency?: Currency

    @Column({
        name: 'to_currency_id',
        comment: '到代币',
    })
    @IsNumber()
    toCurrencyId: number;

    @ApiHideProperty()
    @ManyToOne(() => Currency)
    @JoinColumn({
        name: 'to_currency_id',
    })
    toCurrency?: Currency

    @Column({
        name: 'from_amount',
        comment: '兑入金额',
        type: "decimal", precision: 10, scale: 4, default: 0,
        nullable: true,
    })
    @IsNumber()
    fromAmount: number;

    @Column({
        name: 'fee',
        comment: '手续费',
        type: "decimal", precision: 10, scale: 4, default: 0,
        nullable: true,
    })
    @IsNumber()
    fee: number;

    @Column({
        name: 'to_amount',
        comment: '兑出金额',
        type: "decimal", precision: 10, scale: 4, default: 0,
        nullable: true,
    })
    @IsNumber()
    toAmount: number;

    @Column({
        name: 'ratio',
        comment: '兑换比例',
        type: "decimal", precision: 10, scale: 4, default: 7.78,
        nullable: true,
    })
    @IsNumber()
    ratio: number;

    @Column({
        name: 'status',
        comment: '状态，0兑换失败 1兑换成功',
        type: 'char',
        default: '0',
    })
    @IsString()
    status: string;

    /* 所属用户 */
    @Column({
        name: 'user_id',
        comment: '所属用户'
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
        comment: '创建时间'
    })
    updateTime: number
}