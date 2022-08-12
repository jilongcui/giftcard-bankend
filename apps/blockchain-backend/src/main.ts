import { NestFactory } from '@nestjs/core';
import { BlockchainBackendModule } from './blockchain-backend.module';

async function bootstrap() {
  const app = await NestFactory.create(BlockchainBackendModule);
  await app.listen(3000);
}
bootstrap();
