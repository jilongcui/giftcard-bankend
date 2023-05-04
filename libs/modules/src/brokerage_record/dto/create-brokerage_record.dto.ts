import { OmitType, PartialType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { BrokerageRecord, BrokerageType } from "../entities/brokerage_record.entity";

export class CreateBrokerageRecordDto extends OmitType(BrokerageRecord, ['id', 'createTime'] as const) { }
export class ListBrokerageRecordDto extends PartialType(OmitType(BrokerageRecord, ['id'] as const)) { }
export class ListMyBrokerageRecordDto {
    @IsOptional()
    @IsString()
    type?: BrokerageType
}

export class GetTotalBrokerageDto {
    @IsOptional()
    @IsString()
    type?: BrokerageType
}

export class GetMyTotalBrokerageDto {
    @IsNumber()
    userId: number
    
    @IsOptional()
    @IsString()
    type?: BrokerageType
}

