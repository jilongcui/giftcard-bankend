import { Module, forwardRef } from '@nestjs/common';
import { SharedModule } from '@app/shared/shared.module';
import { SmscodeController } from './smscode.controller';
import { SmscodeService } from './smscode.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    SharedModule,
  ],
  controllers: [SmscodeController],
  providers: [SmscodeService],
  exports: [SmscodeService]
})
export class SmscodeModule { }
