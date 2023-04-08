import { IsString } from "class-validator";

export class CreateScreenshotDto {
    @IsString()
    url: string
}

export class SetCreateScreenshotDto {
    @IsString()
    content: string
    
}