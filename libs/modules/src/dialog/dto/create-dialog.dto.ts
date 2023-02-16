import { IsNumber, IsOptional, IsString } from "class-validator";

export class OpenDialogDto {
    @IsNumber()
    userId: number

    @IsOptional()
    @IsString()
    type?: string
}

export class PromptDto {
    @IsString()
    userId: string

    @IsString()
    dialogId: string

    @IsString()
    text: string
}
