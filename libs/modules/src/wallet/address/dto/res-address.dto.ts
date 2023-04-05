import { IsEnum, IsString } from "class-validator";
import { AddressTypeEnum, AddressTypeNumber } from "../entities/address.entity";

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
    addressType: AddressTypeNumber;
}