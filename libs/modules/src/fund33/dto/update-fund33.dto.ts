import { PartialType } from '@nestjs/swagger';
import { CreateFund33Dto } from './create-fund33.dto';

export class UpdateFund33Dto extends PartialType(CreateFund33Dto) {}
