import { Excel } from "@app/modules/common/excel/excel.decorator";
import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsObject, IsString } from "class-validator";
import { Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class CardInfoDetail {
    @IsString()
    typeName: string

    @IsString()
    typeId: string

    @IsNumber()
    openFee: number

    @IsNumber()
    monthFee: number

    @IsNumber()
    feeRatio: number

    @IsNumber()
    rechargeRatio: number

    @IsNumber()
    rechargeMinFee: number

    @IsNumber()
    validDay: number

    @IsString()
    amountPerMonth: string

    @IsString()
    image: string

    @IsString()
    signImage: string

}

export class Cardinfo {

    @PrimaryGeneratedColumn()
    id: number


    @Column({
        type: 'string',
        length: 10,
    })
    name: string 

    /* 卡片资料 */
    @Column( 'simple-json',{
        name: 'info',
        comment: '认证资料'
    })
    @IsObject()
    info: CardInfoDetail
    
    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}
