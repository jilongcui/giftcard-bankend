import { Module, forwardRef } from '@nestjs/common';
import { SharedModule } from '@app/shared/shared.module';
import { SmscodeController } from './smscode.controller';
import { SmscodeService } from './smscode.service';

@Module({
  imports: [SharedModule],
  controllers: [SmscodeController],
  providers: [SmscodeService],
  exports: [SmscodeService]
})
export class SmscodeModule { }
