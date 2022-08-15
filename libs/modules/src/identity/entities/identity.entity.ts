import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { BaseEntity, Column, ColumnTypeUndefinedError, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Identity extends BaseEntity {
    @PrimaryGeneratedColumn({
        name: 'identity_id',
        comment: '认证ID',
        type: 'int'
    })
    @IsNumber()
    identityId: number

    @Column({
        name: 'mobile',
        unique: true,
        length: 11,
    })
    /* 用户手机号 */
    mobile: string;

    @Column({
        name: 'card_id',
        unique: true,
        length: 20,
    })
    /* 身份证ID */
    cardId: string;
    @Column({
        name: 'real_name',
        length: '50'
    })
    /* 真实名称 */
    realName: string;

    @ApiHideProperty()
    @OneToOne(() => User, user => user.identity)
    @JoinColumn({
        name: 'user_id',
    })
    @IsNumber()
    /* 用户id */
    user: User;
}