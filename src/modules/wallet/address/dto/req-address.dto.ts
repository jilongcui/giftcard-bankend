import { IsString } from "class-validator";

export class ReqAddressDto {
    @IsString()
    currencyId: string;

    @IsString()
    uid: string;

    @IsString()
    type: string;

    @IsString()
    appId: string;
}