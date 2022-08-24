import { repl } from '@nestjs/core';
import { AppModule } from './apps/nestjs-backend/src/app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();

