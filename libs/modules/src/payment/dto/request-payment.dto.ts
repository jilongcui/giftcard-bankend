import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column } from "typeorm";
import { Payment } from "../entities/payment.entity";

export class CreatePaymentDto extends OmitType(Payment, ['id', 'status', 'userId',] as const) { }
export class UpdateAllPaymentDto extends Payment { }
export class UpdatePaymentDto extends PartialType(CreatePaymentDto) { }
export class UpdatePaymentStatusDto extends PickType(Payment, ['status']) { }
export class ListPaymentDto extends PartialType(OmitType(Payment, ['user', 'order', 'bankcard'] as const)) { }
export class ListUnpayPaymentDto {
    @IsOptional()
    @IsNumber()
    activityId?: number
}
export class ListMyPaymentDto {
    @IsOptional()
    @IsString()
    status?: string
}

/* 同步失效的订单 */
export class SyncInvalidPaymentDto {
    /* 所属activityId */
    @IsNumber()
    @IsOptional()
    activityId?: number
}