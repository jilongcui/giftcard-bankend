import { PartialType } from '@nestjs/swagger';
import { CreateCardinfoDto } from './create-cardinfo.dto';

export class UpdateCardinfoDto extends PartialType(CreateCardinfoDto) {}
