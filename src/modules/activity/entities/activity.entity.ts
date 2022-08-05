import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Order } from "src/modules/order/entities/order.entity";
import { Collection } from "src/modules/collection/entities/collection.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    /* 状态 0: 未展出 1:进行中 2:预售 3:发货中 4:销售结束 5:取消 */
    @Column({
        name: 'status',
        comment: '状态 0: 未展出 1:进行中 2:预售 3:发货中 4:销售结束 5:取消',
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

    @Column({
        name: 'presale_price',
        comment: '预售价格'
    })
    @IsNumber()
    presalePrice: number

    @Column({
        name: 'price',
        comment: '正式价格'
    })
    @IsNumber()
    price: number

    @Column({
        name: 'need_order',
        comment: '是否需要预定 0:不需要 1:需要',
        type: 'char',
        default: 0,
        length: 1
    })
    @IsString()
    needOrder: string

    @Column({
        name: 'deliver_delay',
        comment: '发货延迟 ms'
    })
    @IsNumber()
    deliverDelay: number

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
