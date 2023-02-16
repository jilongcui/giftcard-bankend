import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenDialogDto } from './dto/create-dialog.dto';
import { UpdateDialogDto } from './dto/update-dialog.dto';
import { Dialog } from './entities/dialog.entity';

@Injectable()
export class DialogService {
  
  constructor(
    @InjectRepository(Dialog) private readonly dialogRepository: Repository<Dialog>,
  ) {
  }

  findAll() {
    return `This action returns all dialog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dialog`;
  }

  update(id: number, updateDialogDto: UpdateDialogDto) {
    return `This action updates a #${id} dialog`;
  }

  async open(openDialogDto: OpenDialogDto) {
    // 寻找是否有已知对话，不存在就创建
    let dialog = await this.dialogRepository.findOneBy({userId: openDialogDto.userId, type: openDialogDto.type})
    if(!dialog) {
      dialog = await this.dialogRepository.save(openDialogDto)
    }
    // 初始化Chatgpt引擎

    // 等待初始化完成

    // 修改对话状态
    dialog.status = '1'
    dialog = await this.dialogRepository.save(dialog)
    // 发送准备就绪消息
    return {dialog};
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
    return `This action close a #${id} dialog`;
  }

  remove(id: number) {
    return `This action removes a #${id} dialog`;
  }

  async prompt(userId: string, text: string) {
    // 调用引擎发送 text

    // 等待等待引擎回掉函数

  }
}
