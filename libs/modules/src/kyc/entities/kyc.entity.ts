import { Excel } from "@app/modules/common/excel/excel.decorator";
import { User } from "@app/modules/system/user/entities/user.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsObject, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

export class KycCertifyInfoOld {
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

export class KycCertifyInfo {
    // merOrderNo	是	string	商家订单号
    @IsString()
    merOrderNo: string
    // certType	是	string	证件类型 0-身份证 1-护照
    @IsString()
    certType: string
    // idNumber	是	string	身份证号/护照号 （格式 dd/MM/yyyy）
    @IsString()
    idNumber: string
    // idExpiryDate	是	string	证件有效期
    @IsString()
    idExpiryDate: string
    // zhName	否	string	中文姓名
    @IsString()
    zhName?: string
    // enName	否	string	英文名
    @IsString()
    enName?: string
    // sex	是	string	性别 0-女 1-男
    @IsString()
    sex: string
    // email	否	string	电子邮件
    @IsString()
    email?: string
    // phone	否	string	手机号
    @IsString()
    phone?: string
    // homeAddress	是	string	住宅地址
    @IsString()
    homeAddress: string
    // connectAddress	否	string	通讯地址（如果与住宅地址不同需要）
    @IsString()
    connectAddress?: string

    // birthday	是	string	出生年月（格式 dd/MM/yyyy）
    @IsString()
    birthday: string

    // holdCardNumber	否	string	曾经或者现在持有卡片
    @IsString()
    holdCardNumber?: string

    // sourceOfFunds	是	string	收入来源
    @IsString()
    sourceOfFunds: string

    // industry	是	string	行业
    @IsString()
    industry: string

    // jobPosition	是	string	职业
    @IsString()
    jobPosition: string

    // intended	是	string	购卡用途
    @IsString()
    intended: string

    // purposeOfUse	是	string	卡用途
    @IsString()
    purposeOfUse: string

    // faceImage	否	string	身份证正面（证件类型为身份证必须）
    @IsString()
    faceImage?: string
    // backImage	否	string	身份证反面 （证件类型为身份证必须）
    @IsString()
    backImage?: string
    // passImage	否	string	护照页照片（证件类型为护照必须）
    @IsString()
    passImage?: string
    // signImage	是	string	手写签名
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

    /* KYC编号 */
    @Column({
        name: 'order_no',
        default: null,
        length: 10,
        comment: 'KYC编号'
    })
    @IsString()
    @Excel({
        name: 'KYC编号',
    })
    orderNo: string

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
