import { ApiAcceptedResponse, ApiHideProperty } from "@nestjs/swagger"
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator"
// import { Contract } from "../../contract/entities/contract.entity"
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Currency {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'name',
        comment: '币种名称(人民币)',
        length: 50
    })
    @IsString()
    name: string

    @Column({
        name: 'symbol',
        comment: '币种简称',
        length: 50
    })
    @IsString()
    symbol: string

    @Column({
        name: 'reacharge_enalbe',
        comment: '是否能充值',
    })
    @IsBoolean()
    rechargeEnable: boolean

    @Column({
        name: 'reacharge_min',
        comment: '最小充值额度',
    })
    @IsNumber()
    reachargeMin: number

    @Column({
        name: 'withdraw_enable',
        comment: '是否能提币',
    })
    @IsBoolean()
    withdrawEnable: boolean

    @Column({
        name: 'withdraw_min',
        comment: '最小提币额度',
    })
    @IsNumber()
    withdrawMin: number

    @Column({
        name: 'withdraw_max',
        comment: '最大提币额度',
    })
    @IsNumber()
    withdrawMax: number

    @Column({
        name: 'gather_min',
        comment: '最小归集额度',
    })
    @IsNumber()
    gatherMin: number

    @Column({
        name: 'sell_exratio',
        type: "decimal", precision: 10, scale: 4,
        default: 1.0,
        comment: 'exchange ratio to usdt', // exchange ratio
    })
    @IsNumber()
    sell_exratio: number

    @Column({
        name: 'sell_exratio_bias',
        type: "decimal", precision: 10, scale: 4,
        default: 0,
        comment: 'exchange ratio bias percent', // exchange ratio
    })
    @IsNumber()
    sell_exratioBias: number

    @Column({
        name: 'buy_exratio',
        type: "decimal", precision: 10, scale: 4,
        default: 1.0,
        comment: 'exchange ratio to usdt', // exchange ratio
    })
    @IsNumber()
    buy_exratio: number

    @Column({
        name: 'buy_exratio_bias',
        type: "decimal", precision: 10, scale: 4,
        default: 0,
        comment: 'exchange ratio bias percent', // exchange ratio
    })
    @IsNumber()
    buy_exratioBias: number

    @Column({
        name: 'status',
        comment: '代币状态 0: 下架 1: 正常',
        type: 'char',
        length: 1
    })
    @IsString()
    status: string

    @Column({
        name: 'image',
        comment: '代币logo',
        length: 100
    })
    @IsString()
    image: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    // @ManyToOne(() => Chain)
    // chain: Chain

    // @ApiHideProperty()
    // @OneToOne(() => Contract)
    // @JoinColumn({
    //     name: 'contract_id',
    // })
    // contract?: Contract
}
