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
export class ReqSubmitPayDto {
    agent_bill_id: string
    agent_bill_time: string
    pay_amt: number
    goods_name: string
    hy_auth_uid: string
    user_ip: string
    notify_url: string
    return_url?: string
}