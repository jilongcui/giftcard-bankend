import { IsString } from "class-validator"

export class ReqIdentify3ElementDto {
    /*  手机号 */
    @IsString()
    mobile: string;

    /* 身份证号 */
    @IsString()
    cardId: string;

    /* 真实名称 */
    @IsString()
    realName: string;
}