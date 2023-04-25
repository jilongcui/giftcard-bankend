import { PartialType } from '@nestjs/swagger';
import { CreateHomeAddressDto } from './create-homeaddress.dto';
import { IsBoolean } from 'class-validator';

export class UpdateHomeAddressDto extends PartialType(CreateHomeAddressDto) {}

export class UpdateDefaultAddressDto {
    @IsBoolean()
    isDefault: boolean
}