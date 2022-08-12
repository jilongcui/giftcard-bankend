import { OmitType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Address } from "../entities/address.entity";

export class ReqAddNoticeDto extends OmitType(Address, ['id'] as const) { }

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