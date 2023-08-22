import { repl } from '@nestjs/core';
import { AppModule } from './apps/giftcard/src/app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();

