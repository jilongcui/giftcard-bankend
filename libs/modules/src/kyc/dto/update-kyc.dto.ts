import { PartialType } from '@nestjs/swagger';
import { CreateKycDto } from './create-kyc.dto';

export class UpdateKycDto extends PartialType(CreateKycDto) {}

export class UpdateKycStatusDto {
    status: string
}
