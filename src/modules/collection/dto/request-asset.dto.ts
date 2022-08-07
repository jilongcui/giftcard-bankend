import { OmitType, PartialType } from "@nestjs/swagger";
import { IsNumber, IsObject, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Asset } from "../entities/asset.entity";


export class CreateAssetDto {
    @IsNumber()
    price: number;

    @IsNumber()
    userId: number

    @IsNumber()
    collectionId: number

}
export class FlowAssetDto {
    @IsOptional()
    @IsNumber()
    userId?: number
}
export class UpdateAssetDto extends PartialType(CreateAssetDto) { }
export class ListAssetDto extends PartialType(Asset) { }

