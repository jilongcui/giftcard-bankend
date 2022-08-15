import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Collection } from "../../collection/entities/collection.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Contract {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @IsString()
    @Column({
        name: 'chain',
        comment: '合约所在的链',
        length: 50
    })
    chain: string

    @IsString()
    @Column({
        name: 'standard',
        comment: '合约标准 ERC721 ERC1155',
        length: 20
    })
    standard: string

    @IsString()
    @Column({
        name: 'address',
        comment: '合约地址'
    })
    address: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @IsOptional()
    @ApiHideProperty()
    @OneToMany(() => Collection, collection => collection.contract)
    collections: Collection
}
