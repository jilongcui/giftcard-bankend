import { OmitType } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator"
import { PromotionAgent } from "../entities/promotion_agent.entity"

export class CreatePromotionAgentDto extends OmitType(PromotionAgent, ['id', 'userId', 'user', 'createTime', 'status'] as const) {}


export class ListPromotionAgentDto {
    @Type()
    @IsNumber()
    @IsOptional()
    userId?: number

    @IsString()
    @IsOptional()
    status?: string
}

export class ListMyPromotionAgentDto {
    @IsString()
    @IsOptional()
    status?: string
}