import { OmitType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "@app/common/dto/pagination.dto";
import { Identity } from "../entities/identity.entity";

// export class ReqAddNoticeDto extends OmitType(Identity, ['id'] as const) { }

export class ReqIdentityList extends PaginationDto {

    /* 地址 */
    @IsOptional()
    @IsString()
    mobile?: string;

    /* 创建人 */
    @IsOptional()
    @IsString()
    cardId?: string;

    /* 代币类型 */
    @IsOptional()
    @IsString()
    realName?: string;

    /* 代币类型 */
    @IsOptional()
    @IsNumber()
    userId?: number;
}