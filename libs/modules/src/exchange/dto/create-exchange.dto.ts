import { PaginationDto } from "@app/common/dto/pagination.dto";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateExchangeDto {}

export class ListExchangeDto {

    /* 来源币 */
    @IsOptional()
    @IsNumber()
    fromCurrencyId?: number;

    /* 目标币 */
    @IsOptional()
    @IsNumber()
    toCurrencyId?: number;

    /* 交易ID */
    @IsOptional()
    @Type()
    @IsNumber()
    userId?: number;

    /* 创建时间 */
    @IsOptional()
    @IsNumber()
    createTime?: number;

    /* 状态 */
    @IsOptional()
    @IsString()
    status?: string;
}