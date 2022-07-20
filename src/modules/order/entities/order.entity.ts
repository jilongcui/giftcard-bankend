import { Activity } from "src/modules/activity/entities/activity.entity";
import { Collection } from "src/modules/collection/entities/collection.entity";
import { User } from "src/modules/system/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        name: 'desc',
        comment: '订单描述'
    })
    desc: string

    @Column({
        name: 'type',
        comment: '订单种类 0: 活动 1:市场',
        type: 'char',
        length: 1
    })
    type: string

    @Column({
        name: 'total_price',
        comment: '订单总金额'
    })
    totalPrice: number

    @Column({
        name: 'real_price',
        comment: '订单总金额'
    })
    realPrice: number

    @Column({
        name: 'status',
        comment: '订单状态',
        type: 'char',
        length: 1
    })
    status: string

    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ManyToOne(() => Activity, activity => activity.orders)
    activity: Activity

    @ManyToOne(() => User, user => user.orders)
    user: User

    @OneToMany(() => Collection, collection => collection.orders)
    collections: Collection
}
