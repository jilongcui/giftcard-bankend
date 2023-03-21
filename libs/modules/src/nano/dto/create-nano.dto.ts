import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class CreateNanoDto {

    @IsNumber()
    userId: number

    @IsString()
    type: string

    @IsNumber()
    dialogId: number

    @IsString()
    content: string
}

export class MyListNanoDto {
    @Type()
    @IsNumber()
    dialogId: number
}

export class ListNanoDto {
    @IsOptional()
    @Type()
    @IsNumber()
    dialogId?: number

    @IsOptional()
    @Type()
    @IsNumber()
    userId?: number
}