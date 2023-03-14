
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSecurityDto {}

export class CheckSecurityDto {

    @IsOptional()
    @IsString()
    text?: string
}