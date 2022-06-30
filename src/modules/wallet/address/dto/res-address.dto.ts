import { IsString } from "class-validator";

export class ResAddressDto {
    @IsString()
    address: string;
    @IsString()
    privatekeyEncode: string;
}