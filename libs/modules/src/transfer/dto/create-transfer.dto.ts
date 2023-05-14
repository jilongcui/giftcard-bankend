import { PaginationDto } from "@app/common/dto/pagination.dto";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTransferDto {}

export class ListTransferDto {

    /* 来源用户 */
    @IsOptional()
    @IsNumber()
    fromUserId?: number;

    /* 目标用户 */
    @IsOptional()
    @IsNumber()
    toUserId?: number;

    /* 用户ID */
    @IsOptional()
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