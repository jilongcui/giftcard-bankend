import { Excel } from "@app/modules/common/excel/excel.decorator";
import { User } from "@app/modules/system/user/entities/user.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HomeAddress {
    /* Id */
    @PrimaryGeneratedColumn({
        name: 'id',
        comment: '用户ID'
    })
    @IsNumber()
    id: number

    /* 用户名 */
    @Column({
        comment: '用户名',
        length: 50,
        default: null
    })
    @IsString()
    userName: string

    /* unicode */
    @Column({
        comment: '国际编码',
        length: 5,
        default: null
    })
    @IsString()
    unicode: string

    /* 手机号码 */
    @Column({
        comment: '手机号码',
        length: 11,
        default: null
    })
    @IsString()
    phonenumber: string

    /* 城市 */
    @Column({
        comment: '国家',
        length: 20,
        default: '中国'
    })
    @IsString()
    country: string

    /* 城市 */
    @Column({
        comment: '城市',
        length: 50,
        default: null
    })
    @IsString()
    city: string

    /* 街道地址 */
    @Column({
        comment: '街道地址',
        length: 100,
        default: null
    })
    @IsString()
    street: string

    /* 是否默认地址 */
    @Column({
        comment: '是否默认地址',
    })
    @IsBoolean()
    isDefault: boolean

    /* 订单所属用户 */
    @Column({
        name: 'user_id',
        comment: '所属用户'
    })
    @IsNumber()
    @Excel({
        name: '用户ID',
    })
    userId: number
    
    @ApiHideProperty()
    @OneToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    @Excel({
        name: '创建时间',
    })
    createTime: number
}
