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
        comment: '类型 0:首发 1:盲盒 2:预售 3:秒杀'
    })
    @IsNumber()
    type: number

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

    /* 状态 0: 未展出 1:展示 2:预售 3:发货中 4:销售结束 5:取消 */
    @Column({
        name: 'status',
        comment: '状态 0: 未展出 1:展示 2:预售 3:发货中 4:销售结束 5:取消',
        type: 'char',
        length: 1
    })
    @IsString()
    status: string

    // @Column({
    //     name: 'start_time',
    //     comment: '开始时间'
    // })
    // @IsNumber()
    // startTime: number
    /* 创建时间 */
    @CreateDateColumn({ name: 'start_time', comment: '开始时间' })
    @ApiHideProperty()
    startTime: Date

    // @Column({
    //     name: 'end_time',
    //     comment: '结束时间'
    // })
    // @IsNumber()
    // endTime: number

    @CreateDateColumn({ name: 'end_time', comment: '结束时间' })
    @ApiHideProperty()
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
