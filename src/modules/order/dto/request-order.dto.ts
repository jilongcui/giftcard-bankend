import { OmitType, PartialType } from "@nestjs/swagger";
import { Order } from "../entities/order.entity";

export class CreateOrderDto extends OmitType(Order, ['id', 'status', 'userId', 'desc'] as const) { }
export class UpdateAllOrderDto extends Order { }
export class UpdateOrderDto extends PartialType(CreateOrderDto) { }
export class ListOrderDto extends PartialType(Order) { }