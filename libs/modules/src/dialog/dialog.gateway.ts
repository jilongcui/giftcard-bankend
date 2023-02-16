import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { DialogService } from './dialog.service';
import { OpenDialogDto, PromptDto } from './dto/create-dialog.dto';
import { UpdateDialogDto } from './dto/update-dialog.dto';
import { Dialog } from './entities/dialog.entity';

@WebSocketGateway({
  // path: '/ws',
  cors: {
    origin: '*',
  },
})
export class DialogGateway implements OnGatewayConnection<DialogGateway>, OnGatewayDisconnect<DialogGateway> {
  constructor(private readonly dialogService: DialogService) {}

  handleConnection(client: DialogGateway, ...args: any[]): any {
  }

  handleDisconnect(client: DialogGateway): any {

  }

  @SubscribeMessage('openDialog')
  create(@MessageBody() createDialogDto: OpenDialogDto) {
    return this.dialogService.open(createDialogDto);
  }

  @SubscribeMessage('prompt')
  prompt(@MessageBody() promptDto: PromptDto) {
    return this.dialogService.prompt(promptDto);
  }

  @SubscribeMessage('closeDialog')
  close(@MessageBody() id: number) {
    return this.dialogService.close(id);
  }

  @SubscribeMessage('findAllDialog')
  findAll() {
    return this.dialogService.findAll();
  }

  @SubscribeMessage('findOneDialog')
  findOne(@MessageBody() id: number) {
    return this.dialogService.findOne(id);
  }

  @SubscribeMessage('updateDialog')
  update(@MessageBody() updateDialogDto: UpdateDialogDto) {
    return this.dialogService.update(updateDialogDto.id, updateDialogDto);
  }

  @SubscribeMessage('removeDialog')
  remove(@MessageBody() id: number) {
    return this.dialogService.remove(id);
  }
}
