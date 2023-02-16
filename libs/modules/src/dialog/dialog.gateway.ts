import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { DialogService } from './dialog.service';
import { OpenDialogDto } from './dto/create-dialog.dto';
import { UpdateDialogDto } from './dto/update-dialog.dto';

@WebSocketGateway()
export class DialogGateway {
  constructor(private readonly dialogService: DialogService) {}

  @SubscribeMessage('openDialog')
  create(@MessageBody() createDialogDto: OpenDialogDto) {
    return this.dialogService.open(createDialogDto);
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
