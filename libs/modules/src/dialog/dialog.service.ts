import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsResponse } from '@nestjs/websockets';
import { Socket } from 'net';
import { Repository } from 'typeorm';
import { EngineService } from '../engine/engine.service';
import { CreateNanoDto } from '../nano/dto/create-nano.dto';
import { Nano } from '../nano/entities/nano.entity';
import { OpenDialogDto, PromptDto } from './dto/create-dialog.dto';
import { UpdateDialogDto } from './dto/update-dialog.dto';
import { Dialog } from './entities/dialog.entity';

@Injectable()
export class DialogService {
  logger = new Logger(Dialog.name)
  constructor(
    @InjectRepository(Dialog) private readonly dialogRepository: Repository<Dialog>,
    @InjectRepository(Nano) private readonly nanoRepository: Repository<Nano>,
    private readonly engine: EngineService,
  ) {
    
  }

  findAll() {
    return `This action returns all dialog`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} dialog`;
  }

  update(id: number, updateDialogDto: UpdateDialogDto) {
    return `This action updates a #${id} dialog`;
  }

  async open(openDialogDto: OpenDialogDto, client: Socket) {
    if(!(openDialogDto.appmodelId || openDialogDto.type || 1) || !openDialogDto.userId ) {
      // return {code: 400, message: "输入参数不正确"}
      client.emit('notice', {code: 400, data: '输入参数不正确'})
      return
    }
    openDialogDto.appmodelId = openDialogDto.appmodelId || openDialogDto.type
    // 寻找是否有已知对话，不存在就创建
    let dialog = await this.dialogRepository.findOneBy({userId: openDialogDto.userId, appmodelId: openDialogDto.appmodelId})
    if(!dialog) {
      dialog = await this.dialogRepository.save(openDialogDto)
    }
    // 初始化Chatgpt引擎

    // 等待初始化完成
    const result = await this.engine.open(parseInt(openDialogDto.appmodelId), openDialogDto.userId.toString(), '')
    client.emit('completion', result)

    // 修改对话状态
    dialog.status = '1'
    dialog = await this.dialogRepository.save(dialog)
    // 发送准备就绪消息
    return {code: 200, data: dialog};
  }

  async close(id: number) {
    // 关闭Chatgpt引擎

    // 修改dialog状态
    let dialog = await this.dialogRepository.findOneBy({id: id})
    if(!dialog) {
      return {code: 200, message: "对话不存在"}
    }
    dialog.status = '1'
    dialog = await this.dialogRepository.save(dialog)
    return {code: 200};
  }

  remove(id: number) {
    return `This action removes a #${id} dialog`;
  }

  async prompt(client: Socket, prompt: PromptDto){
    this.logger.debug(`prompt> ${prompt.userId}: ${prompt.text}`)

    if(!prompt.dialogId || !prompt.userId || !prompt.text) {
      // return {code: 400, message: "输入参数不正确"}
      client.emit('notice', {code: 400, data: '输入参数不正确'})
      return
    }
    const dialog = await this.dialogRepository.findOneBy({id: parseInt(prompt.dialogId)})
    const nano: CreateNanoDto = {
      userId: parseInt(prompt.userId),
      dialogId: parseInt(prompt.dialogId),
      type: '0', // prompt
      content: prompt.text
    }
    await this.nanoRepository.save(nano)

    // client.emit('notice', {code: 201, data: '思考着，请等待'})
    // 调用引擎发送 text
    const result = await this.engine.prompt(dialog.appmodelId, prompt.userId, prompt.text)

    // 把记录写入数据库
    if(result.code === 200) {
      const nano: CreateNanoDto = {
        userId: parseInt(prompt.userId),
        dialogId: parseInt(prompt.dialogId),
        type: '1', // answer
        content: result.data.text
      }
      await this.nanoRepository.save(nano)
      client.emit('completion', result)
    } else {
      client.emit('notice', result)
    }
  }
}
