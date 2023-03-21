import { IsNumber, IsOptional, IsString } from "class-validator";

export class ResListMyMagicboxDto {
    @IsNumber()
    id: number

    @IsNumber()
    mycount: number

    @IsString()
    name: string

    @IsNumber()
    supply: number

    @IsNumber()
    currency: number

    @IsString()
    image: string

    @IsOptional()
    @IsString()
    status?: string
}