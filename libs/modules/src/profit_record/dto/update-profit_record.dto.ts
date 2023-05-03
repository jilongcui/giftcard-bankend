import { PartialType } from '@nestjs/swagger';
import { CreateProfitRecordDto } from './create-profit_record.dto';

export class UpdateProfitRecordDto extends PartialType(CreateProfitRecordDto) {}
