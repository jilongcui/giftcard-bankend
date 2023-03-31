import { IsEnum, IsString } from "class-validator";
import { AddressTypeEnum } from "./req-address.dto";

export class ResAddressDto {
    @IsString()
    address: string;
    @IsString()
    privatekeyEncode: string;
}

export class ResRequestAddressDto {
    @IsString()
    address: string;

    @IsEnum(AddressTypeEnum)
    chain: AddressTypeEnum;
}