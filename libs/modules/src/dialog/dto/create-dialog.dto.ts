import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class OpenDialogDto {

    @IsOptional()
    @IsString()
    appmodelId?: string
}

export class CloseDialogDto {

    @Type()
    @IsNumber()
    dialogId: number
}

export class CreateDialogDto {
    @IsNumber()
    userId: number

    @IsOptional()
    @IsString()
    userName?: string

    @IsOptional()
    @IsString()
    appmodelId?: string
}

export class PromptDto {
    @IsString()
    dialogId: string

    @IsString()
    text: string
}
