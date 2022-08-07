import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Activity } from "src/modules/activity/entities/activity.entity";
import { Collection } from "src/modules/collection/entities/collection.entity";
import { User } from "src/modules/system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AssetRecord {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'type',
        type: 'char',
        comment: '类型 0: Create 1: Sell 2: Buy 3: Down 4: Transfer'
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
        comment: '金额'
    })
    @IsOptional()
    @IsNumber()
    price?: number

    @Column({
        name: 'from_id',
        comment: '来源用户id'
    })
    @IsOptional()
    @IsNumber()
    fromId?: number

    @Column({
        name: 'from_name',
        type: 'varchar',
        length: '50',
        comment: '来源用户name'
    })
    @IsOptional()
    @IsString()
    fromName?: string

    @Column({
        name: 'to_id',
        comment: '目标用户id'
    })
    @IsOptional()
    @IsNumber()
    toId?: number

    @Column({
        name: 'to_name',
        type: 'varchar',
        length: '50',
        comment: '目标用户name'
    })
    @IsOptional()
    @IsString()
    toName?: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
