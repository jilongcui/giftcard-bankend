import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { Logger, UseFilters, UseGuards, WsExceptionFilter } from '@nestjs/common';
import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'net';
import { DialogService } from './dialog.service';
import { CreateDialogDto, OpenDialogDto, PromptDto } from './dto/create-dialog.dto';
import { UpdateDialogDto } from './dto/update-dialog.dto';
import {} from '@nestjs/platform-socket.io'
import { Dialog } from './entities/dialog.entity';
import { JwtWsAuthGuard } from '@app/common/guards/jwt-ws-auth.guard';
import { AllWsExceptionsFilter } from '@app/common/filters/all-ws-exception.filter';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { MemberAuthGuard } from '@app/common/guards/member-auth.guard';

// @UseFilters(new AllWsExceptionsFilter())
@UseGuards(JwtWsAuthGuard)
@WebSocketGateway({
  // path: '/ws',
  // allowEIO3: true,
  cors: {
    origin: '*',
  },
})
export class DialogGateway implements OnGatewayConnection<WebSocket>, OnGatewayDisconnect<WebSocket> {

  logger = new Logger(DialogGateway.name)
  constructor(private readonly dialogService: DialogService) {}

  handleConnection(client: any, ...args: any[]): any {
    // console.log(JSON.stringify(client.handshake))
  }

  handleDisconnect(client: WebSocket): any {

  }

  @UseGuards(MemberAuthGuard)
  @SubscribeMessage('openDialog')
  create(@MessageBody() openDialogDto: OpenDialogDto, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName, UserInfoPipe) nickName: string, @ConnectedSocket() client: Socket) {
    this.logger.debug(`openDialog userId ${userId}: ${nickName}`)
    const createDialogDto: CreateDialogDto = {
      userId: userId,
      userName: nickName,
      appmodelId: openDialogDto.appmodelId,
    }
    return this.dialogService.open(createDialogDto, client);
  }

  @SubscribeMessage('prompt')
  prompt(@MessageBody() promptDto: PromptDto, @UserDec(UserEnum.userId) userId: number, @ConnectedSocket() client: Socket) {
    const event = 'prompt';
    this.dialogService.prompt(promptDto, userId, client);
    return { event, promptDto };
  }

  @SubscribeMessage('closeDialog')
  close(@MessageBody() id: number, @UserDec(UserEnum.userId) userId: number,) {
    return this.dialogService.close(id, userId);
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
