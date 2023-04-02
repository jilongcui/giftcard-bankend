import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AddressTypeEnum } from "../../address/entities/address.entity";

@Entity()
export class RechargeCollect {
    @PrimaryGeneratedColumn({
        name: 'id',
        comment: '主ID',
    })
    id: number;

    @Column({
        name: 'address',
        comment: '付款地址',
        length: 128
    })
    address: string;

    @Column({
        name: 'currency_type',
        comment: '代币类型 BTC/ETH/TRC/BSC',
    })
    addressType: AddressTypeEnum;

    @Column({
        name: 'currency_id',
        comment: '关联currency表',
    })
    currencyId: number;

    @Column({
        name: 'to',
        comment: '收款地址',
        length: 128,
        nullable: true,
        default: null
    })
    to: string;

    @Column({
        name: 'amount',
        comment: '汇款金额',
        nullable: true,
        default: 0
    })
    amount: number;

    @Column({
        name: 'txid',
        comment: '交易ID',
        nullable: true,
        default: null,
    })
    txid: string;

    @Column({
        name: 'fee_state',
        comment: '是否提供了汇总手续费，1为是，0为否，防止重复提供手续费',
        default: 0
    })
    feeState: number;

    @Column({
        name: 'state',
        comment: '状态，1为已汇总，0为等待汇总',
        type: 'tinyint',
        default: 0,
    })
    state: number;

    @Column({
        name: 'confirm_state',
        comment: '交易确认状态，0为未确认，1为已确认',
        type: 'tinyint',
        default: 0
    })
    confirmState: number;

    @Column({
        name: 'dealtime',
        comment: '汇总时间'
    })
    dealTime: number;

    @Column({
        name: 'createtime',
        comment: '创建时间'
    })
    createTime: number;
}