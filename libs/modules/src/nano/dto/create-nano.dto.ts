import { IsNumber, IsString } from "class-validator"

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
