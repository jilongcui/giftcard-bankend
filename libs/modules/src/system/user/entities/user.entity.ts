import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsEmail, IsPhoneNumber, Allow, IsBoolean } from "class-validator";
import { BaseEntity } from "@app/common/entities/base.entity";
import { Excel } from "@app/modules/common/excel/excel.decorator";
import { ExcelTypeEnum } from "@app/modules/common/excel/excel.enum";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from "typeorm";
import { Dept } from "../../dept/entities/dept.entity";
import { Post } from "../../post/entities/post.entity";
import { Role } from "../../role/entities/role.entity";
import { Identity } from "@app/modules/identity/entities/identity.entity";
import { Account } from "@app/modules/account/entities/account.entity";
import { Member } from "@app/modules/member/entities/member.entity";
import { Kyc } from "@app/modules/kyc/entities/kyc.entity";
import { HomeAddress } from "@app/modules/homeaddress/entities/homeaddress.entity";
import { Order } from "apps/giftcard/src/order/entities/order.entity";
import { Bankcard } from "apps/giftcard/src/bankcard/entities/bankcard.entity";

@Entity()
// @Tree("closure-table", {
//     closureTableName: "user_closure",
//     ancestorColumnName: (column) => "ancestor_" + column.databaseName,
//     descendantColumnName: (column) => "descendant_" + column.databaseName,
// })
export class User extends BaseEntity {
    /* 用户Id */
    @PrimaryGeneratedColumn({
        name: 'user_id',
        comment: '用户ID'
    })
    @Type()
    @IsNumber()
    @Excel({
        name: '用户ID'
    })
    userId: number

    /* 用户账号 */
    @Column({
        name: 'user_name',
        comment: '用户账号',
        length: 30,
    })
    @IsString()
    @Excel({
        name: '用户账号'
    })
    userName: string

    /* 用户昵称 */
    @Column({
        name: 'nick_name',
        comment: '用户昵称',
        length: 30
    })
    @IsString()
    @Excel({
        name: '用户昵称'
    })
    nickName: string

    /* 用户Vip等级 */
    @Column({
        name: 'vip',
        default: 0,
        comment: '用户Vip等级'
    })
    @Type()
    @IsNumber()
    @Excel({
        name: '用户Vip等级'
    })
    vip: number

    /* 推广大使Id */
    @Column({
        comment: '推广大使ID',
        default: null
    })
    @Type()
    @IsNumber()
    @Excel({
        name: '推广大使Id'
    })
    promotionAgentId?: number

    /* 用户类型 */
    @Column({
        name: 'user_type',
        comment: '用户类型（00系统用户, 01普通用户, 02微信用户）',
        length: 2,
        default: '00'
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '用户类型'
    })
    userType?: string

    /* 用户邮箱 */
    @Column({
        comment: '用户邮箱',
        length: 50,
        unique: true,
        default: null
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '用户邮箱'
    })
    email?: string

    /* 手机号码 */
    @Column({
        comment: '手机号码',
        length: 11,
        unique: true,
        default: null
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '手机号码'
    })
    phonenumber?: string

    /* 微信OpenID */
    @Column({
        comment: '微信OpenID',
        length: 128,
        default: null
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '微信OpenID'
    })
    openId?: string

    /* 微信UnionID */
    @Column({
        comment: '微信UnionID',
        length: 128,
        default: null
    })
    @IsOptional()
    @IsString()
    @Excel({
        name: '微信UnionID'
    })
    unionId?: string

    @Column({
        comment: '用户性别（0男 1女 2未知）',
        type: 'char',
        length: 1,
        default: '0'
    })
    @IsOptional()
    @IsString()
    sex: string

    /* 头像地址 */
    @Column({
        comment: '头像地址',
        length: 100,
        default: ''
    })
    @IsOptional()
    @IsString()
    avatar?: string

    /* 密码 */
    @Column({
        comment: '密码',
        length: 100,
        default: '',
        select: false
    })
    @Excel({
        type: ExcelTypeEnum.IMPORT,
        name: '密码'
    })
    @IsString()
    password: string

    @ApiHideProperty()
    @Column({
        comment: '盐加密',
        length: 100,
        default: '',
        select: false
    })
    salt: string

    /* 帐号安全状态（0:未设置密码 1:正常）*/
    @Column({
        name: 'security_status',
        comment: '帐号安全状态（0:未设置密码 1:正常）',
        type: 'char',
        length: 1,
        default: '0'
    })
    @Type()
    @IsOptional()
    @IsString()
    securityStatus: string

    /* 帐号状态 */
    @Column({
        comment: '帐号状态（0正常 1停用）',
        type: 'char',
        length: 1,
        default: '0'
    })
    @IsString()
    @Excel({
        name: '帐号状态',
        dictType: 'sys_normal_disable'
    })
    status: string

    /* 邀请码 */
    @Column({
        name: 'invite_code',
        comment: '邀请码',
        length: 6,
        default: ''
    })
    @Excel({
        name: '邀请码'
    })
    inviteCode: string

    @ApiHideProperty()
    @Column({
        name: 'del_flag',
        comment: '删除标志（0代表存在 2代表删除）',
        type: 'char',
        length: 1,
        default: '0'
    })
    delFlag: string

    /* 最后登录IP */
    @Column({
        name: 'login_ip',
        comment: '最后登录IP',
        length: 128,
        default: ''
    })
    @IsOptional()
    @IsString()
    loginIp?: string

    // @TreeChildren()
    // children: User[]

    // @TreeParent()
    // parent: User

    /* 最后登录时间 */
    @Column({
        name: 'login_date',
        comment: '最后登录时间',
        default: null
    })
    @IsOptional()
    @IsString()
    loginDate?: Date

    @ApiHideProperty()
    @ManyToOne(() => Dept, dept => dept.users)
    dept: Dept

    @ApiHideProperty()
    @OneToOne(() => Identity, identity => identity.user)
    identity: Identity

    @ApiHideProperty()
    @OneToOne(() => Kyc, kyc => kyc.user)
    kyc?: Kyc

    @ApiHideProperty()
    @IsOptional()
    @OneToMany(() => HomeAddress, address => address.user)
    addresses?: HomeAddress[]

    @ApiHideProperty()
    @OneToOne(() => Member, member => member.user)
    member: Member

    @ApiHideProperty()
    @ManyToMany(() => Post, post => post.users)
    @JoinTable()
    posts: Post[]

    @ApiHideProperty()
    @ManyToMany(() => Role, role => role.users)
    @JoinTable()
    roles: Role[]

    @ApiHideProperty()
    @IsOptional()
    @OneToMany(() => Order, order => order.user)
    orders?: Order[]

    @ApiHideProperty()
    @IsOptional()
    @OneToMany(() => Account, account => account.user)
    accounts?: Account[]

    @ApiHideProperty()
    @IsOptional()
    @OneToMany(() => Bankcard, bankcard => bankcard.user)
    bankcards?: Bankcard[]
}