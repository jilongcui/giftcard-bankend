import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { Order } from "../entities/order.entity";

export class CreateOrderDto extends OmitType(Order, ['id', 'status', 'userId', 'desc', 'realPrice', 'totalPrice'] as const) { }
export class UpdateAllOrderDto extends Order { }
export class UpdateOrderDto extends PartialType(CreateOrderDto) { }
export class UpdateOrderStatusDto extends PickType(Order, ['status']) { }
export class ListOrderDto extends PartialType(Order) { }