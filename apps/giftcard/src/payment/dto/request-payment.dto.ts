import { ApiProperty, OmitType, PartialType, PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Column } from "typeorm";
import { Payment } from "../entities/payment.entity";

export class CreatePaymentDto extends OmitType(Payment, ['id', 'status', 'userId',] as const) { }
export class UpdateAllPaymentDto extends Payment { }
export class UpdatePaymentDto extends PartialType(CreatePaymentDto) { }
export class UpdatePaymentStatusDto extends PickType(Payment, ['status']) { }
export class ListPaymentDto extends PartialType(OmitType(Payment, ['user', 'order', 'bankcard'] as const)) { }
export class WebSignDto {
    @IsOptional()
    @IsNumber()
    bankcardId?: number
}

export class PayWithCardDto {
    @IsNumber()
    @Type()
    orderId: number

    @IsNumber()
    @Type()
    bankcardId: number
}

export class PayWithBalanceDto {
    @IsNumber()
    @Type()
    orderId: number
}

export  enum WeixinPayType {
    XCX = 'XCX',
    GZH = 'GZH',
    NTV = 'NTV', // Native
}

export class WeixinPayForMemberDto {
    @IsNumber()
    @Type()
    orderId: number

    @IsOptional()
    // @Type()
    // @ApiProperty({
    //     description: 'List of enums',
    //     enum: WeixinPayType
    // })
    @IsEnum(WeixinPayType)
    type?: WeixinPayType // 1: 小程序 2: 公众号
}

export class ConfirmPayWithCardDto {
    @IsNumber()
    @Type()
    paymentId: number

    @IsString()
    verifyCode: string
}

export class WebSignNotifyDto {
    merch_id: string
    out_trade_no: string
    out_trade_time: string
    sign_no: string
    sign: string
}

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

export class ReqSendSMSDto {
    version: number
    agent_bill_id: string
    agent_bill_time: string
    pay_amt: number
    goods_name: string
    hy_auth_uid: string // signNo
    user_ip: string
    notify_url: string
    return_url?: string
}

export class ReqConfirmPayDto {
    version: number
    hy_token_id: string
    verify_code: string
}

export class ReqCryptoNotifyDto {
    agent_id?: string
    encrypt_data?: string
    sign?: string
}

export class ReqPaymentNotify {
    agent_id?: number
    agent_bill_id: string
    agent_bill_time: string
    hy_bill_no: string
    hy_deal_time: string
    deal_note: string
    pay_amt: string
    real_amt: string
    status: string
    hy_auth_uid: string
}

export class ReqWeixinPaymentNotifyDto {
    id: string
    create_time: string
    event_type: string
    resource_type: string
    resource: {
        algorithm: string
        ciphertext: string
        associated_data: string
        original_type: string
        nonce: string
    }
    summary: string
}

export class WeixinPaymentNotify {
    transaction_id:string
    amount:{
        payer_total:number,
        total:number,
        currency:string
        payer_currency:string
    }
    mchid:string
    trade_state:string
    bank_type:string
    success_time:string
    payer:{
        openid:string
    }
    out_trade_no:string
    appid:string
    trade_state_desc:string
    trade_type:string
    attach:string
    scene_info:{
        device_id:string
    }
}