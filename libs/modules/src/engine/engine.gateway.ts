import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { EngineService } from './engine.service';
import { CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';

@WebSocketGateway()
export class EngineGateway {
  constructor(private readonly engineService: EngineService) {}

  @SubscribeMessage('createEngine')
  create(@MessageBody() createEngineDto: CreateEngineDto) {
    return this.engineService.create(createEngineDto);
  }

  @SubscribeMessage('findAllEngine')
  findAll() {
    return this.engineService.findAll();
  }

  @SubscribeMessage('findOneEngine')
  findOne(@MessageBody() id: number) {
    return this.engineService.findOne(id);
  }

  @SubscribeMessage('updateEngine')
  update(@MessageBody() updateEngineDto: UpdateEngineDto) {
    return this.engineService.update(updateEngineDto.id, updateEngineDto);
  }

  @SubscribeMessage('removeEngine')
  remove(@MessageBody() id: number) {
    return this.engineService.remove(id);
  }
}
