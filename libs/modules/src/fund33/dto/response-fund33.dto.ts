export interface Fund33Response<T = any>  {
    data: T;
    msg: string
    status: number
    success: boolean
}

export class Fund33QueryBalance {
    /* 实际金额 */
    cardNumber: string
    /* 货币 - ISO 4217 */
    currency: number
    /* 实际金额 */
    actualAmount: string
    /* 有效期日期 */
    validityDate: string  

    /* 卡销售日期 */
    salesDate: string

    /* 卡关闭时间 */
    closeDate: string
}

export class Fund33RechargeDto {

    // "amount":"20",
    amount: string

    // "cardNumber":"6244810070000117",
    cardNumber: string

    // "completeTime":"",
    completeTime: string

    // "createTime":"2023-04-02 17:07:09",
    createTime: string

    // "ext":"",
    ext?: string

    // "merOrderNo":"345342352343",
    merOrderNo: string

    // "orderNo":"4534234363464342",
    orderNo: string

    // "settleAmount":"20.00",

    settleAmount: string

    // "status":0
    status: number
}

export class Fund33QueryTransaction {
    /* 卡号 */
    acctNumber: string
    /* 交易日期 */
    transDate: string
    /* 商品编码 */
    merchCode: string
    /* 交易货币 ISO-4217 */
    transCurrency: string
    /* 交易金额 */
    transAmount: string
    /* 账单货币 ISO-4217 */
    billCurrency: string
    /* 账单金额 */
    billAmount: string
    /* 商户名称 */
    merchantName: string
    /* 交易描述 */
    transDescription: string
}

export class Fund33QueryUNTransaction {
    /* 卡号 */
    acctNumber: string
    /* 交易日期 */
    transDate: string
    /* 商品编码 */
    merchCode: string
    /* 交易货币 ISO-4217 */
    transCurrency: string
    /* 交易金额 */
    transAmount: string
    /* 账单货币 ISO-4217 */
    billCurrency: string
    /* 账单金额 */
    billAmount: string
    /* 商户名称 */
    merchantName: string
    /* 交易描述 */
    transDescription: string
}