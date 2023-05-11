import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
export class UpdateOrderStatusDto {
    @IsString()
    status: string
}

export class UpdateOrderHomeAddressDto {
    @IsOptional()
    @IsString()
    homeAddress?: string

    @IsString()
    @IsOptional()
    userName?: string

    @IsString()
    @IsOptional()
    userPhone?: string
}

export class UpdateOrderShipDto {
    @IsString()
    shipName: string

    @IsString()
    shipNo: string
}
