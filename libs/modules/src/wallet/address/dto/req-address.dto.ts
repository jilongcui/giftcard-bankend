import { IsString } from "class-validator";

export class ReqAddressCreateDto {
    // @IsString()
    // currencyId: string;

    @IsString()
    userId: number;

    @IsString()
    appId: string;

    @IsString()
    addressType: string;
}