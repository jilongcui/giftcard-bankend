import { ApiHideProperty } from "@nestjs/swagger";
import { Collection } from "src/modules/collection/entities/collection.entity";
import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Contract {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'chain',
        comment: '合约所在的链',
        length: 50
    })
    chain: string

    @Column({
        name: 'type',
        comment: '合约标准 ERC721 ERC1155',
        length: 20
    })
    standard: string

    @Column({
        name: 'address',
        comment: '合约地址'
    })
    address: string

    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ApiHideProperty()
    @OneToMany(() => Collection, collection => collection.contract)
    collections: Collection
}
