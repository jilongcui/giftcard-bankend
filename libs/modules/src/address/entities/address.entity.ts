import { Collection } from "@app/modules/collection/entities/collection.entity";
import { User } from "@app/modules/system/user/entities/user.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Address {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'address',
        length: '64',
        comment: '地址'
    })
    @IsString()
    address: string

    @Column({
        name: 'private_key',
        length: '256',
        comment: '私钥'
    })
    @IsString()
    private_key: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @Column({
        name: 'user_id',
        comment: '地址所属用户'
    })
    @IsNumber()
    userId: number

    @ApiHideProperty()
    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User
}

