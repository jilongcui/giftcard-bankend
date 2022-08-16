import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Address } from "../entities/address.entity";

export class CreateAddressDto extends OmitType(Address, ['id',] as const) { }
export class UpdateAllAddressDto extends Address { }
export class UpdateAddressDto extends PartialType(CreateAddressDto) { }
export class UpdateAddressStatusDto extends PickType(Address, []) { }
export class ListAddressDto extends PartialType(OmitType(Address, ['user'] as const)) { }
export class ListMyAddressDto {
    @IsOptional()
    @IsString()
    status?: string
}