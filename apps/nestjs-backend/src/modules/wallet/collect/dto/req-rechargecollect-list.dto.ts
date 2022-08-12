import { OmitType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { RechargeCollect } from "../entities/rechage-collect.entity";

export class ReqAddRechageCollectDto extends OmitType(RechargeCollect, ['id'] as const) { }

export class ReqRechargeCollectListDto extends PaginationDto {

    /* 地址 */
    @IsOptional()
    @IsString()
    address?: string;

    /* 交易ID */
    @IsOptional()
    @IsString()
    txid?: string;

    /* 币种ID */
    @IsOptional()
    @IsNumber()
    currencyId?: number;

    /* 代币类型 */
    @IsOptional()
    @IsString()
    currencyType?: string;

    /* 确认状态 */
    @IsOptional()
    @IsNumber()
    confirmState?: number;
}