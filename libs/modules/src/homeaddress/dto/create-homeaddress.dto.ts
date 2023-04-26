import { OmitType } from "@nestjs/swagger";
import { HomeAddress } from "../entities/homeaddress.entity";
import { Type } from "class-transformer";
import { IsString, IsOptional, IsNumber, IsBoolean } from "class-validator";

export class CreateHomeAddressDto extends OmitType(HomeAddress, ['id', 'userId',] as const) {}


export class ListMyHomeAddressDto {
    @IsString()
    @IsOptional()
    city?: string

    @IsString()
    @IsOptional()
    street?: string

    @IsOptional()
    @IsString()
    postcode?: string

    @IsBoolean()
    isDefault: boolean
    
    @IsString()
    @IsOptional()
    userName?: string

    @IsString()
    @IsOptional()
    phonenumber?: string
}

export class ListHomeAddressDto {
    @IsString()
    @IsOptional()
    city?: string

    @IsString()
    @IsOptional()
    street?: string

    @IsOptional()
    @IsString()
    postcode?: string

    @IsBoolean()
    isDefault: boolean
    
    @Type()
    @IsNumber()
    @IsOptional()
    userId?: number

    @IsString()
    @IsOptional()
    userName?: string

    @IsString()
    @IsOptional()
    phonenumber?: string
}
