import { PartialType } from '@nestjs/mapped-types';
import { CreateNanoDto } from './create-nano.dto';

export class UpdateNanoDto extends PartialType(CreateNanoDto) {
  id: number;
}
