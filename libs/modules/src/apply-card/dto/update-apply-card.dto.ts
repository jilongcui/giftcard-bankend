import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { ApplyCard, ApplyCardStatus } from '../entities/apply-card.entity';
import { CreateApplyCardDto } from './create-apply-card.dto';

export class UpdateApplyCardDto extends PartialType(ApplyCard) {}
export class ListApplyCardDto extends PartialType(OmitType(ApplyCard, ['user', 'kyc', 'cardinfo','bankcard'] as const)) { }

export class UpdateApplyCardStatusDto {
    @IsNumber()
    id: number
}
