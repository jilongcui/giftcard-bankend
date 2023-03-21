import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Type } from "class-transformer";
import { MemberInfo } from "./member-info.entity";
import { Excel } from "@app/modules/common/excel/excel.decorator";
import { ExcelTypeEnum } from "@app/modules/common/excel/excel.enum";

@Entity()
export class Member {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'start_time',
        comment: '会员开始时间'
    })
    @Excel({
        type: ExcelTypeEnum.EXPORT,
        name: '会员开始时间',
    })
    startTime: Date

    @Column({
        name: 'end_time',
        comment: '会员结束时间'
    })
    @Excel({
        type: ExcelTypeEnum.EXPORT,
        name: '会员结束时间',
    })
    endTime: Date

    @Column({
        name: 'user_id',
        comment: '订单所属用户'
    })
    @Type()
    @IsNumber()
    userId: number

    @ApiHideProperty()
    @OneToOne(() => User, user => user.member)
    @JoinColumn({
        name: 'user_id',
    })
    user?: User

    @Column({
        name: 'member_info_id',
        comment: '订单所属用户'
    })
    @Type()
    @IsNumber()
    memberInfoId: number

    @ApiHideProperty()
    @ManyToOne(() => MemberInfo)
    @JoinColumn({
        name: 'member_info_id',
    })
    memberInfo?: MemberInfo

    @ApiHideProperty()
    @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
    @Excel({
        type: ExcelTypeEnum.EXPORT,
        name: '更新时间',
    })
    updateTime?: Date
}

