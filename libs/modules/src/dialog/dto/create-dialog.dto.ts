import { IsNumber, IsOptional } from "class-validator";

export class OpenDialogDto {
    @IsNumber()
    userId: number

    @IsOptional()
    @IsNumber()
    type?: string
}
