import { PartialType } from '@nestjs/mapped-types';
import { OpenDialogDto } from './create-dialog.dto';

export class UpdateDialogDto extends PartialType(OpenDialogDto) {
  id: number;
}
