import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { NanoService } from './nano.service';
import { CreateNanoDto } from './dto/create-nano.dto';
import { UpdateNanoDto } from './dto/update-nano.dto';

@WebSocketGateway()
export class NanoGateway {
  constructor(private readonly nanoService: NanoService) {}

  @SubscribeMessage('createNano')
  create(@MessageBody() createNanoDto: CreateNanoDto) {
    return this.nanoService.create(createNanoDto);
  }

  @SubscribeMessage('findAllNano')
  findAll() {
    return this.nanoService.findAll();
  }

  @SubscribeMessage('findOneNano')
  findOne(@MessageBody() id: number) {
    return this.nanoService.findOne(id);
  }

  @SubscribeMessage('updateNano')
  update(@MessageBody() updateNanoDto: UpdateNanoDto) {
    return this.nanoService.update(updateNanoDto.id, updateNanoDto);
  }

  @SubscribeMessage('removeNano')
  remove(@MessageBody() id: number) {
    return this.nanoService.remove(id);
  }
}
