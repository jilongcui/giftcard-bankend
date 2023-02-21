import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { Logger } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'net';
import { DialogService } from './dialog.service';
import { OpenDialogDto, PromptDto } from './dto/create-dialog.dto';
import { UpdateDialogDto } from './dto/update-dialog.dto';
import { Dialog } from './entities/dialog.entity';

@WebSocketGateway({
  // path: '/ws',
  allowEIO3: true,
  cors: {
    origin: '*',
  },
})
export class DialogGateway implements OnGatewayConnection<WebSocket>, OnGatewayDisconnect<WebSocket> {

  logger = new Logger(DialogGateway.name)
  constructor(private readonly dialogService: DialogService) {}

  handleConnection(client: WebSocket, ...args: any[]): any {
  }

  handleDisconnect(client: WebSocket): any {

  }

  @SubscribeMessage('openDialog')
  create(@MessageBody() createDialogDto: OpenDialogDto, @UserDec(UserEnum.userId) userId: number, @ConnectedSocket() client: Socket) {
    this.logger.debug(`openDialog userId ${userId}`)
    return this.dialogService.open(createDialogDto, client);
  }

  @SubscribeMessage('prompt')
  prompt(@MessageBody() promptDto: PromptDto, @ConnectedSocket() client: Socket) {
    const event = 'prompt';
    this.dialogService.prompt(client, promptDto);
    return { event, promptDto };
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
