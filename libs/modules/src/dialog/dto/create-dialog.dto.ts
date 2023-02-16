import { IsNumber, IsOptional, IsString } from "class-validator";

export class OpenDialogDto {
    @IsNumber()
    userId: number

    @IsOptional()
    @IsString()
    type?: string
}

export class PromptDto {
    @IsNumber()
    userId: number

    @IsString()
    text: string
}
