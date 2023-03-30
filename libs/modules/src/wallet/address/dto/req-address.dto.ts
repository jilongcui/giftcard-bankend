import { OmitType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "@app/common/dto/pagination.dto";
import { Address } from "../entities/address.entity";

export class ReqAddressCreateDto {
    // @IsString()
    // currencyId: string;

    @IsString()
    userId: number;

    @IsString()
    appId: number;

    @IsString()
    addressType: string;
}

export class ReqAddressRequestDto {
    // @IsString()
    // currencyId: string;

    @IsString()
    userId: number;

    @IsString()
    appId: number;

    @IsString()
    addressType: string;
}

export class ReqMyAddressDto {
    // @IsString()
    // currencyId: string;

    @IsString()
    addressType: string;
}

export class ReqBindAddressDto {
    /*  CRI地址 */
    @IsString()
    address: string;
}

export class ReqAddressAddDto extends OmitType(Address, ['id', 'status', 'createTime', 'addressType'] as const) { }

export class ReqAddressList extends PaginationDto {

    /* 地址 */
    @IsOptional()
    @IsString()
    address?: string;

    /* 创建人 */
    @IsOptional()
    @IsString()
    userId?: number;

    // /* 代币类型 */
    // @IsOptional()
    // @IsString()
    // currencyType?: string;

    /* 代币类型 */
    @IsOptional()
    @IsString()
    addressType: string;
}

export declare const AddressTypeEnum: {
    readonly _1: 'ETH';
    readonly _56: 'BSC';
    readonly _195: 'TRC';
    readonly _186: 'CRI';
    readonly _6: 'BTC';
};
export declare type AddressTypeEnum = typeof AddressTypeEnum[keyof typeof AddressTypeEnum];
