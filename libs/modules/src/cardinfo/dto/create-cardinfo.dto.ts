import { IsNumber, IsObject, IsString } from "class-validator"
import { CardInfoDetail } from "../entities/cardinfo-detail.entity"

export class CreateCardinfoDto {
    @IsString()
    name: string

    @IsObject()
    info: CardInfoDetail

}

export class ListCardinfoDto {
    @IsString()
    name: string     
}
