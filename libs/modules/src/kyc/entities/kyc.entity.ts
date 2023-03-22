import { Excel } from "@app/modules/common/excel/excel.decorator";
import { User } from "@app/modules/system/user/entities/user.entity";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsObject, IsString } from "class-validator";
import { Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { KycCertifyInfoDto } from "../dto/create-kyc.dto";

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
    info: KycCertifyInfoDto

    /* 状态 0: 未认证 1: 认证中 2: 认证完成*/
    @Column({
        name: 'status',
        comment: '状态 0: 未认证 1: 认证中 2: 认证完成',
        default: '0',
        type: 'char',
        length: 1
    })
    @IsString()
    @Excel({
        name: '状态',
        readConverterExp: {
            0: "未认证", 1: "认证中", 2: "认证完成"
        }
    })
    status: string

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
    @ManyToOne(() => User)
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
