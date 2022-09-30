import { OmitType, PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { User } from "../../system/user/entities/user.entity";
import { Collection } from "../entities/collection.entity";


export class CreateCollectionDto extends OmitType(Collection, ['id'] as const) { }
export class UpdateCollectionDto extends PartialType(Collection) { }
export class ListCollectionDto extends PartialType(OmitType(Collection, ['images'] as const)) { }

export class ListMyCollectionDto {
    @IsOptional()
    @IsString()
    status?: string
}

export class ListNewCollectionDto {
    @IsOptional()
    @IsString()
    type?: string
}
