import { ApiHideProperty } from "@nestjs/swagger";
import { Product } from "src/modules/product/entities/product.entity";
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
        comment: '合约种类 ERC721 ERC1155',
        length: 20
    })
    type: string

    @Column({
        name: 'address',
        comment: '合约地址'
    })
    address: string

    @CreateDateColumn({
        name: 'creat_time',
        comment: '创建时间'
    })
    createTime: number

    @ApiHideProperty()
    @OneToMany(() => Product, product => product.contract)
    products: Product
}
