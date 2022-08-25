import { OmitType, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { Asset } from "../entities/asset.entity";


export class CreateAssetDto {
    @IsNumber()
    price: number;

    @IsNumber()
    userId: number

    @IsNumber()
    assetNo: number

    @IsNumber()
    collectionId: number

}
export class FlowAssetDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    userId?: number
}
export class UpdateAssetDto extends PartialType(CreateAssetDto) { }
export class ListAssetDto extends PartialType(OmitType(Asset, ['user', 'collection',] as const)) { }

