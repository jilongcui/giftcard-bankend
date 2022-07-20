import { IsOptional } from "class-validator"
import { Contract } from "src/modules/contract/entities/contract.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Currency {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'name',
        comment: '币种名称(人民币)',
        length: 50
    })
    name: string

    @Column({
        name: 'symbol',
        comment: '币种简称',
        length: 50
    })
    symbol: string

    @Column({
        name: 'reacharge_enalbe',
        comment: '是否能充值',
    })
    rechargeEnable: boolean

    @Column({
        name: 'reacharge_min',
        comment: '最小充值额度',
    })
    reachargeMin: number

    @Column({
        name: 'withdraw_enable',
        comment: '是否能提币',
    })
    withdrawEnable: boolean

    @Column({
        name: 'withdraw_min',
        comment: '最小提币额度',
    })
    withdrawMin: number

    @Column({
        name: 'withdraw_max',
        comment: '最大提币额度',
    })
    withdrawMax: number

    @Column({
        name: 'gather_min',
        comment: '最小归集额度',
    })
    gatherMin: number


    @Column({
        name: 'status',
        comment: '代币状态 0: 下架 1: 正常',
        type: 'char',
        length: 1
    })
    status: string

    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    // @ManyToOne(() => Chain)
    // chain: Chain

    @IsOptional()
    @OneToOne(() => Contract)
    @JoinColumn({
        name: 'contract_id',
    })
    contract?: Contract
}
