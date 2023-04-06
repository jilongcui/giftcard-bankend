import { PartialType } from '@nestjs/swagger';
import { CreateScreenshotDto } from './create-screenshot.dto';

export class UpdateScreenshotDto extends PartialType(CreateScreenshotDto) {}
