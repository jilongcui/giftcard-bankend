import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BlockchainBackendModule } from './blockchain-backend.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BlockchainBackendModule, {
    transport: Transport.TCP,
  });
  await app.listen();
}
bootstrap();
