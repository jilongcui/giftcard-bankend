import { IsNumber } from "class-validator";
import { BaseEntity, Column, ColumnTypeUndefinedError, Entity, PrimaryGeneratedColumn } from "typeorm";

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
        length: 11
    })
    /* 用户手机号 */
    mobile: string;

    @Column({
        name: 'card_id',
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

    @Column({
        name: 'user_id',
    })
    @IsNumber()
    /* 用户id */
    userId: number;
}