import { IsString } from "class-validator";

export class CreatePdfDto {}
export class ParsePdfDto {

    @IsString()
    fileurl: string
}
