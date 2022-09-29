import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Order } from "../entities/order.entity";

export class CreateOrderDto extends OmitType(Order, ['id', 'image', 'status', 'userId', 'userName', 'desc', 'totalPrice',] as const) { }
export class CreateLv1OrderDto extends OmitType(Order, ['id', 'type', 'image', 'status', 'userId', 'userName', 'assetId', 'assetType', 'desc', 'realPrice', 'totalPrice',] as const) { }
export class CreateLv2OrderDto extends OmitType(Order, ['id', 'type', 'image', 'status', 'userId', 'userName', 'count', 'activityId', 'desc', 'realPrice', 'totalPrice',] as const) { }
export class RechargeOrderDto extends OmitType(Order, ['id', 'type', 'image', 'status', 'userId', 'userName', 'count', 'assetId', 'activityId', 'desc', 'totalPrice',] as const) { }
export class UpdateAllOrderDto extends Order { }
export class UpdateOrderDto extends PartialType(Order) { }
export class UpdateOrderStatusDto extends PickType(Order, ['status']) { }
export class ListOrderDto extends PartialType(OmitType(Order, ['activity', 'user', 'collections', 'payment'] as const)) { }
export class ListUnpayOrderDto {
    @IsOptional()
    @IsNumber()
    activityId?: number
}
export class ListRechargeOrderDto {
    @IsOptional()
    @IsString()
    status?: string
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