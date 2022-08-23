/* 同步失效的订单 */
export class PayResponse<T> {
    code?: string

    msg?: string

    sub_code: string

    data: T

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

export class CryptoResponse {
    ret_code?: string
    ret_msg: string
    encrypt_data: string
    sign: string
}