/* 同步失效的订单 */
export class PayResponse<T> {
    code?: string

    data: T

    msg?: string

    sub_code: string

    sub_msg: string

    sign: string
}

export class WebSignResponse {
    merch_id?: string
    out_trade_no: string
    out_trade_time: string
    sign_url: string
}

export class SendSMSResponse {
    agent_id?: number
    ret_code: string
    ret_msg: string
    hy_token_id: string
}

export class ConfirmPayResponse {
    agent_id?: number
    ret_code: string
    ret_msg: string
    hy_bill_no: string
}

export class CryptoResponse {
    ret_code?: string
    ret_msg: string
    encrypt_data: string
    sign: string
}

