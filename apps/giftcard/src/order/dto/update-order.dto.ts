import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsString } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
export class UpdateOrderStatusDto {
    @IsString()
    status: string
}

export class UpdateOrderShipDto {
    @IsString()
    shipName: string

    @IsString()
    shipNo: string
}
