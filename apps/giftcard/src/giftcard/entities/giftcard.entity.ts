import { ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Type } from "class-transformer";
import { Cardinfo } from "@app/modules/cardinfo/entities/cardinfo.entity";
import { User } from "@app/modules/system/user/entities/user.entity";
import { Order } from "../../order/entities/order.entity";
import { Excel } from "@app/modules/common/excel/excel.decorator";
import { ExcelTypeEnum } from "@app/modules/common/excel/excel.enum";

@Entity()
export class Giftcard {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 银行卡号 */
    @Column({
        name: 'card_no',
        length: 50,
        comment: '银行卡号'
    })
    @Excel({
        name: '银行卡号'
    })
    @IsOptional()
    @IsString()
    cardNo?: string

    // /* 持卡人预留手机号 */
    // @Column({
    //     name: 'mobile',
    //     length: 15,
    //     comment: '持卡人预留手机号'
    // })
    // @IsOptional()
    // @IsString()
    // mobile?: string

    /* 卡的名称 */
    @Column({
        name: 'card_name',
        length: 150,
        comment: '卡的名称'
    })
    @Excel({
        name: '卡的名称'
    })
    @IsString()
    cardName: string

    /* 商品类型 0: 实物商品 */
    @Column({
        name: 'card_type',
        default: '0',
        comment: '商品类型 0: 实物商品',
    })
    @IsOptional()
    @IsString()
    cardType?: string

    /* 银行卡价格 */
    @Column({
        name: 'price',
        default: 0.00,
        type: "decimal", precision: 10, scale: 2,
        comment: '银行卡价格'
    })
    @Excel({
        name: '银行卡价格'
    })
    @IsNumber()
    price: number

    /* 运费HKD */
    @Column({
        name: 'shipfee',
        default: 0.00,
        type: "decimal", precision: 10, scale: 2,
        comment: '运费HKD'
    })
    @Excel({
        name: '运费HKD'
    })
    @IsNumber()
    shipfee: number

    /* 手续费HKD */
    @Column({
        name: 'tradefee',
        default: 0.00,
        type: "decimal", precision: 10, scale: 2,
        comment: '手续费HKD'
    })
    @Excel({
        name: '手续费HKD'
    })
    @IsNumber()
    tradefee: number

    /* 银行卡状态 0: 已下架 1: 已上架 2: 已锁定 3: 已售出*/
    @Column({
        name: 'status',
        default: '0',
        comment: '银行卡状态 0: 已下架 1: 已上架 2: 已锁定 3: 已售出'
    })
    @Excel({
        name: '银行卡状态',
        type: ExcelTypeEnum.EXPORT
    })
    @IsString()
    status: string

    @Column({
        name: 'user_id',
        default: null,
        comment: '所属用户'
    })
    @Excel({
        name: '所属用户',
        type: ExcelTypeEnum.EXPORT
    })
    @Type()
    @IsNumber()
    userId?: number

    @ApiHideProperty()
    @ManyToOne(() => User, user => user.bankcards)
    @JoinColumn({
        name: 'user_id',
    })
    user: User

    @ApiHideProperty()
    @OneToOne(() => Order)
    @IsOptional()
    @JoinColumn({
        name: 'order_id',
    })
    order?: Order

    // @ApiHideProperty()
    @IsArray()
    @Column({
        name: 'images',
        comment: '图片',
        type: 'simple-array',
    })
    images: string[]

    // @ApiHideProperty()
    @IsArray()
    @Column({
        name: 'detail_images',
        comment: '描述图片',
        type: 'simple-array',
    })
    detailImages: string[]

    /* 卡片详情 */
    @Column({
        name: 'desc',
        // default: '',
        type: 'longtext',
        comment: '卡片详情',
    })
    @IsOptional()
    @IsString()
    desc?: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
