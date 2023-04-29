import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Giftcard } from "../entities/giftcard.entity";

export class CreateGiftcardDto extends OmitType(Giftcard, ['id', 'status', 'userId', 'order'] as const) { }
export class CreateGiftcardKycDto extends OmitType(Giftcard, ['id', 'status', 'userId', 'order'] as const) { }
export class UpdateAllGiftcardDto extends Giftcard { }
export class UpdateGiftcardDto extends PartialType(Giftcard) { }
export class UpdateGiftcardStatusDto extends PickType(Giftcard, ['status']) { }
export class ListGiftcardDto extends PartialType(OmitType(Giftcard, ['user', 'images', 'detailImages', 'order'] as const)) { }

export class ListMyGiftcardDto {
    @IsOptional()
    @IsString()
    status?: string
}