import { OmitType, PartialType } from "@nestjs/swagger";
import { IsNumber, IsObject } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Asset } from "../entities/asset.entity";


export class CreateAssetDto {
    @IsNumber()
    value: number;

    @IsNumber()
    userId: number

    @IsNumber()
    collectionId: number

}
export class UpdateAssetDto extends PartialType(CreateAssetDto) { }
export class ListAssetDto extends PartialType(Asset) { }
