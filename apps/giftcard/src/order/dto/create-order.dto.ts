import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { Order } from "../entities/order.entity";
import { IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateOrderDto extends PartialType(Order) { }

export class CreateOrderDto extends OmitType(Order, ['id', 'image', 'status', 'userId', 'userName', 'desc', 'shipName', 'shipNo', 'totalPrice',] as const) { }
export class ListOrderDto extends PartialType(OmitType(Order, ['payment', 'user'] as const)) { }
export class RequestBankcardOrderDto {
    @IsString()
    assetType: string

    @IsNumber()
    assetId: number
    
    @IsOptional()
    @IsString()
    remark?: string
    
    @IsString()
    phone: string

    @IsString()
    homeAddress: string
}

export class ListUnpayOrderDto {
    @IsOptional()
    @IsNumber()
    activityId?: number
}

export class ListMyOrderDto {
    @IsOptional()
    @IsString()
    status?: string
}

/* 同步失效的订单 */
export class SyncInvalidOrderDto {
    /* 所属activityId */
    @IsNumber()
    @IsOptional()
    activityId?: number
}

