import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { EngineService } from './engine.interface';
import { CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';

@WebSocketGateway()
export class EngineGateway {
  constructor() {}
}
