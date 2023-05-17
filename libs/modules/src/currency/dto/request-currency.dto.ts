import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { Currency } from "../entities/currency.entity";

export class CreateCurrencyDto extends OmitType(Currency, ['id'] as const) { }
export class UpdateAllCurrencyDto extends Currency { }
export class UpdateCurrencyDto extends PartialType(CreateCurrencyDto) { }
export class ListCurrencyDto extends PartialType(OmitType(Currency, [] as const)) { }

export class UpdateRatioDto extends PickType(CreateCurrencyDto, ['sell_exratio', 'sell_exratioBias', 'buy_exratio', 'buy_exratioBias']) {}
