import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BlockchainAppModule } from './blockchain-app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    BlockchainAppModule, {
    transport: Transport.TCP,
  });
  await app.listen();
}
bootstrap();
