import { ApiHideProperty } from "@nestjs/swagger";
import { Product } from "src/modules/product/entities/product.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Activity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'type',
        comment: '类型 0:首发 1:盲盒 2:预售 3:秒杀'
    })
    type: number

    @Column({
        name: 'title',
        comment: '活动主题'
    })
    title: string

    @Column({
        name: 'ruleInfo',
        comment: '规则介绍'
    })
    ruleInfo: string

    @Column({
        name: 'status',
        comment: '状态 0: 等待开始 1:展示 2:预售 3:发货中 4:销售结束 5:取消',
        type: 'char',
        length: 1
    })
    status: string

    @Column({
        name: 'start_time',
        comment: '开始时间'
    })
    startTime: number

    @Column({
        name: 'end_time',
        comment: '结束时间'
    })
    endTime: number

    @Column({
        name: 'supply',
        comment: '供应量'
    })
    supply: number

    @Column({
        name: 'current',
        comment: '当前释放'
    })
    current: number

    @Column({
        name: 'presale_price',
        comment: '预售价格'
    })
    presalePrice: number

    @Column({
        name: 'price',
        comment: '正式价格'
    })
    price: number

    @Column({
        name: 'need_order',
        comment: '是否需要预定 0:不需要 1:需要',
        type: 'char',
        default: 0,
        length: 1
    })
    needOrder: string

    @Column({
        name: 'deliver_delay',
        comment: '发货延迟 ms'
    })
    deliverDelay: number

    @ApiHideProperty()
    @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
    createTime: number

    @OneToMany(() => Product, product => product.activity)
    products: Product
}
