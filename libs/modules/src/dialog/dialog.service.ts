import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException, WsResponse } from '@nestjs/websockets';
import { Socket } from 'net';
import { Repository } from 'typeorm';
import { EngineService } from '../engine/engine.service';
import { CreateNanoDto } from '../nano/dto/create-nano.dto';
import { Nano } from '../nano/entities/nano.entity';
import { CreateDialogDto, OpenDialogDto, PromptDto } from './dto/create-dialog.dto';
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

  async open(openDialogDto: CreateDialogDto) {
    if(!(openDialogDto.appmodelId) || !openDialogDto.userId ) {
      // return {code: 400, message: "输入参数不正确"}
      throw new WsException('参数不正确')
    }
    openDialogDto.appmodelId = openDialogDto.appmodelId || '1'
    // this.logger.debug(openDialogDto.appmodelId)
    // 寻找是否有已知对话，不存在就创建
    let dialog = await this.dialogRepository.findOneBy({userId: openDialogDto.userId, appmodelId: openDialogDto.appmodelId})
    if(!dialog) {
      dialog = await this.dialogRepository.save(openDialogDto)
    }
    // this.logger.debug(JSON.stringify(dialog))
    // 初始化Chatgpt引擎

    // 等待初始化完成
    const result = await this.engine.open(parseInt(openDialogDto.appmodelId), openDialogDto.userId.toString(), openDialogDto.userName)
    // client.emit('completion', result)

    // 修改对话状态
    dialog.status = '1'
    dialog = await this.dialogRepository.save(dialog)
    return {...dialog, welcome: result.text}
  }

  async close(id: number, userId: number) {
    // 关闭Chatgpt引擎

    // 修改dialog状态
    let dialog = await this.dialogRepository.findOneBy({id: id, userId: userId})
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

  async prompt(prompt: PromptDto, userId: number){
    this.logger.debug(`prompt> ${userId}: ${prompt.text}`)

    if(!prompt.dialogId || !userId || !prompt.text) {
      throw new WsException("输入参数不正确")
    }
    const dialog = await this.dialogRepository.findOneBy({
      id: parseInt(prompt.dialogId), userId: userId
    })
    const nano: CreateNanoDto = {
      userId: userId,
      dialogId: parseInt(prompt.dialogId),
      type: '0', // prompt
      content: prompt.text
    }
    await this.nanoRepository.save(nano)

    // 调用引擎发送 text
    const result = await this.engine.prompt(dialog.appmodelId, userId.toString(), prompt.text)

    // 把记录写入数据库
    const nano2: CreateNanoDto = {
      userId: userId,
      dialogId: parseInt(prompt.dialogId),
      type: '1', // answer
      content: result.text
    }
    await this.nanoRepository.save(nano2)
    return result
  }
}
