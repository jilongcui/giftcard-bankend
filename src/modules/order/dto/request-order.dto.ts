import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column } from "typeorm";
import { Order } from "../entities/order.entity";

export class CreateOrderDto extends OmitType(Order, ['id', 'image', 'status', 'userId', 'desc', 'realPrice', 'totalPrice'] as const) { }
export class UpdateAllOrderDto extends Order { }
export class UpdateOrderDto extends PartialType(CreateOrderDto) { }
export class UpdateOrderStatusDto extends PickType(Order, ['status']) { }
export class ListOrderDto extends PartialType(Order) { }
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