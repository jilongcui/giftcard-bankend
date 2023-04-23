import { Excel } from "@app/modules/common/excel/excel.decorator";
import { User } from "@app/modules/system/user/entities/user.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsObject, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export class KycCertifyInfo {
    @IsString()
    userName: string

    @IsString()
    firstName: string // 名

    @IsString()
    lastName: string // 姓

    @IsString()
    birthDay: string // 生日

    @IsString()
    idCardNo: string

    @IsString()
    country: string // 国籍

    @IsString()
    idCardType: string // ‘0’ 身份证，1: 护照

    @IsString()
    idCardFrontImage: string

    @IsString()
    idCardBackImage: string

    @IsString()
    holderImage: string

    @IsString()
    signImage: string

}

@Entity()
export class Kyc {

    @PrimaryGeneratedColumn()
    id: number

    /* 认证资料 */
    @Column( 'simple-json',{
        name: 'info',
        comment: '认证资料'
    })
    @Excel({
        name: '认证资料',
    })
    @IsObject()
    info: KycCertifyInfo

    /* 状态 0: 未认证 1: 认证成功 2: 认证失败 */
    @Column({
        name: 'status',
        comment: '状态 0: 未认证 1: 认证成功 2: 认证失败',
        default: '0',
        type: 'char',
        length: 1
    })
    @IsString()
    @Excel({
        name: '状态',
        readConverterExp: {
            0: "未认证", 1: "认证成功", 2: "认证失败"
        }
    })
    status: string

    /* 证件类型 0: 身份证 1: 护照*/
    @Column({
        name: 'card_type',
        comment: '证件类型 0: 身份证 1: 护照',
        default: '0',
        type: 'char',
        length: 1
    })
    @IsString()
    @Excel({
        name: '状态',
        readConverterExp: {
            0: "身份证", 1: "护照",
        }
    })
    cardType: string

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
