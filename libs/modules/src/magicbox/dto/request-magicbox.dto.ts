import { OmitType, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { Magicbox } from "../entities/magicbox.entity";


export class CreateMagicboxDto {
    @IsNumber()
    price: number;

    @IsNumber()
    userId: number

    @IsNumber()
    activityId: number

    @IsNumber()
    collectionId: number

    @IsNumber()
    index: number

    @IsNumber()
    assetId: number

}
export class FlowMagicboxDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    userId?: number
}
export class ListMyMagicboxDto {
    /* 市场状态(0:下架 1: 上架 2:锁定) */
    @IsOptional()
    @IsString()
    status?: string

    /* 盲盒状态(1: 已拥有 2: 已开启 ) */
    @IsOptional()
    @IsString()
    openStatus?: string
}
export class UpdateMagicboxDto extends PartialType(CreateMagicboxDto) { }
export class ListMagicboxDto extends PartialType(OmitType(Magicbox, ['user', 'asset', 'collection', 'activity',] as const)) { }

