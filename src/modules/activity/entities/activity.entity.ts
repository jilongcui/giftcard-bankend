import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Order } from "src/modules/order/entities/order.entity";
import { Collection } from "src/modules/collection/entities/collection.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Presale } from "./presale.entity";

@Entity()
export class Activity {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 类型 0:首发 1:盲盒 2:预售 3:秒杀 */
    @Column({
        name: 'type',
        type: 'char',
        length: 1,
        default: 0,
        comment: '类型 0:首发 1:盲盒 2:预售 3:秒杀'
    })
    @IsString()
    type: string

    @Column({
        name: 'title',
        comment: '活动主题'
    })
    @IsString()
    title: string

    @Column({
        name: 'ruleInfo',
        comment: '规则介绍'
    })
    @IsString()
    ruleInfo: string

    /* 状态 0: 未展示 1:进行中 2:已卖完  3:活动结束 */
    @Column({
        name: 'status',
        comment: '状态 0: 未展示 1:进行中 2:已卖完  3:活动结束',
        type: 'char',
        length: 1
    })
    @IsString()
    status: string

    @Column({
        name: 'start_time',
        type: 'datetime',
        comment: '开始时间'
    })
    @IsString()
    startTime: Date

    @Column({
        name: 'cover_image',
        comment: '活动封面'
    })
    @IsString()
    coverImage: string

    @Column({
        name: 'end_time',
        type: 'datetime',
        comment: '结束时间'
    })
    @IsString()
    endTime: Date

    @Column({
        name: 'supply',
        comment: '供应量'
    })
    @IsNumber()
    supply: number

    @Column({
        name: 'current',
        comment: '当前释放'
    })
    @IsNumber()
    current: number

    /* 正式价格 */
    @Column({
        name: 'price',
        comment: '正式价格'
    })
    @IsNumber()
    price: number

    @Column({
        name: 'deliver_delay',
        comment: '发货延迟 ms'
    })
    @IsOptional()
    @IsNumber()
    deliverDelay?: number

    /* 推荐 */
    @Column({
        name: 'recommend',
        comment: '是否推荐 0: 未推荐 1: 推荐',
        type: 'char',
        length: 1,
        default: '0'
    })
    @IsOptional()
    @IsString()
    recommend?: string

    /* 用户昵称 */
    @ApiHideProperty()
    @Column({
        name: 'author_name',
        comment: '创作者',
        length: 30
    })
    @IsOptional()
    @IsString()
    authorName?: string

    /* 头像地址 */
    @ApiHideProperty()
    @Column({
        comment: '头像地址',
        length: 100,
        default: ''
    })
    @IsOptional()
    @IsString()
    avatar?: string

    @ApiHideProperty()
    @OneToOne(() => Presale, { cascade: true })
    @JoinColumn({
        name: 'presale_id',
    })
    @IsOptional()
    presale?: Presale

    @ApiHideProperty()
    @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
    createTime: number

    @ApiHideProperty()
    @IsOptional()
    @OneToMany(() => Collection, collection => collection.activity)
    collections?: Collection[]

    @ApiHideProperty()
    @IsOptional()
    @OneToMany(() => Order, order => order.activity)
    orders?: Order[]
}
