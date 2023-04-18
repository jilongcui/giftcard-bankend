import { PaginationDto } from "@app/common/dto/pagination.dto";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateExchangeDto {}

export class ReqExchangeListDto extends PaginationDto {

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
    @IsNumber()
    userId?: number;

    /* 币种ID */
    @IsOptional()
    @IsNumber()
    createTime?: number;

    /* 状态 */
    @IsOptional()
    @IsString()
    status?: string;
}