import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Bankcard } from "../entities/bankcard.entity";

export class CreateBankcardDto extends OmitType(Bankcard, ['id', 'status', 'userId', 'signTradeNo', 'signTradeTime', 'kyc', 'kycId','cardinfo', 'order'] as const) { }
export class CreateBankcardKycDto extends OmitType(Bankcard, ['id', 'status', 'kycId', 'userId', 'signTradeNo', 'signTradeTime', 'kyc', 'cardinfo','order'] as const) { }
export class UpdateAllBankcardDto extends Bankcard { }
export class UpdateBankcardDto extends PartialType(Bankcard) { }
export class UpdateBankcardStatusDto extends PickType(Bankcard, ['status']) { }
export class UpdateBankcardUserDto extends PickType(Bankcard, ['userId']) { }
export class UpdateBankcardCvvCodeDto extends PickType(Bankcard, ['bankCVVCode']) { }
export class ListBankcardDto extends PartialType(OmitType(Bankcard, ['user', 'kyc', 'cardinfo','signTradeNo', 'signTradeTime','order'] as const)) { }

export class ListMyBankcardDto {
    @IsOptional()
    @IsString()
    status?: string
}