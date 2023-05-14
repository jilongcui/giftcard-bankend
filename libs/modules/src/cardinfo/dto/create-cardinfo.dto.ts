import { IsNumber, IsObject, IsOptional, IsString } from "class-validator"
import { MemberInfo } from "../entities/member-info.entity"

export class CreateCardinfoDto {
    @IsString()
    name: string

    @IsObject()
    info: MemberInfo

}

export class ListCardinfoDto {
    @IsString()
    @IsOptional()
    name?: string     
}
