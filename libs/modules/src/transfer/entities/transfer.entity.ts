import { Currency } from "@app/modules/currency/entities/currency.entity";
import { User } from "@app/modules/system/user/entities/user.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Transfer {
    @PrimaryGeneratedColumn({
        name: 'id',
        comment: '主ID',
    })
    @IsNumber()
    id: number;

    @Column({
        name: 'from_user_id',
        comment: '从用户',
    })
    @IsNumber()
    fromUserId: number;

    @ApiHideProperty()
    @ManyToOne(() => User)
    @JoinColumn({
        name: 'from_user_id',
    })
    fromUser?: User

    @Column({
        name: 'to_user_id',
        comment: '到代币',
    })
    @IsNumber()
    toUserId: number;

    @ApiHideProperty()
    @ManyToOne(() => User)
    @JoinColumn({
        name: 'to_user_id',
    })
    toUser?: User

    @Column({
        name: 'currency_id',
        comment: '代币',
    })
    @IsNumber()
    currencyId: number;

    @ApiHideProperty()
    @ManyToOne(() => Currency)
    @JoinColumn({
        name: 'currency_id',
    })
    currency?: Currency

    @Column({
        name: 'from_amount',
        comment: '转入金额',
        type: "decimal", precision: 10, scale: 4, default: 0,
        nullable: true,
    })
    @IsNumber()
    fromAmount: number;

    @Column({
        name: 'fee',
        comment: '转账手续费',
        type: "decimal", precision: 10, scale: 4, default: 0,
        nullable: true,
    })
    @IsNumber()
    fee: number;

    @Column({
        name: 'to_amount',
        comment: '转出金额',
        type: "decimal", precision: 10, scale: 4, default: 0,
        nullable: true,
    })
    @IsNumber()
    toAmount: number;

    @Column({
        name: 'status',
        comment: '状态，0转账失败 1转账成功',
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