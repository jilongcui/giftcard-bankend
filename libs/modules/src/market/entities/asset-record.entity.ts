import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Activity } from "../../activity/entities/activity.entity";
import { Collection } from "../../collection/entities/collection.entity";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AssetRecord {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 类型 0: Create 1: Sell 2: Buy 3: Down 4: Transfer 5:Open */
    @Column({
        name: 'type',
        type: 'char',
        comment: '类型 0: Create 1: Sell 2: Buy 3: Down 4: Transfer 5:Open'
    })
    @IsString()
    type: string

    @Column({
        name: 'asset_id',
        comment: '关联的asset Id'
    })
    @IsOptional()
    @IsNumber()
    assetId: number

    @Column({
        name: 'price',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '金额'
    })
    @IsOptional()
    @IsNumber()
    price?: number

    @Column({
        name: 'from_id',
        default: 0,
        comment: '来源用户id'
    })
    @IsOptional()
    @IsNumber()
    fromId?: number

    @Column({
        name: 'from_name',
        type: 'varchar',
        length: '50',
        default: '',
        comment: '来源用户name'
    })
    @IsOptional()
    @IsString()
    fromName?: string

    @Column({
        name: 'to_id',
        default: 0,
        comment: '目标用户id'
    })
    @IsOptional()
    @IsNumber()
    toId?: number

    @Column({
        name: 'to_name',
        type: 'varchar',
        default: '',
        length: '50',
        comment: '目标用户name'
    })
    @IsOptional()
    @IsString()
    toName?: string

    @Column({
        name: 'txId',
        default: null,
        nullable: true,
        length: 128,
        comment: '交易id'
    })
    @IsOptional()
    @IsString()
    txId?: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
