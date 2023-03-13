import { MODE_CHAT, MODE_COMPLETE, MODE_IMAGE } from '@app/common/contants/decorator.contant';
import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException, WsResponse } from '@nestjs/websockets';
import { Socket } from 'net';
import { tap, map, Observable, catchError, switchMap } from 'rxjs';
import { Repository } from 'typeorm';
import { Appmodel } from '../appmodel/entities/appmodel.entity';
import { EngineChatService } from '../engine/engine-chat.service';
import { EngineCompleteService } from '../engine/engine-complete.service';
import { EngineImageService } from '../engine/engine-image.service';
import { InjectEngine } from '../engine/engine.decorator';
import { EngineService } from '../engine/engine.interface';
import { CreateNanoDto } from '../nano/dto/create-nano.dto';
import { Nano } from '../nano/entities/nano.entity';
import { AuthService } from '../system/auth/auth.service';
import { CreateDialogDto, OpenDialogDto, PromptDto } from './dto/create-dialog.dto';
import { UpdateDialogDto } from './dto/update-dialog.dto';
import { Dialog } from './entities/dialog.entity';

@Injectable()
export class DialogService {
  logger = new Logger(Dialog.name)
  stringMap: Map<string, [string]> 
  constructor(
    @InjectRepository(Dialog) private readonly dialogRepository: Repository<Dialog>,
    @InjectRepository(Nano) private readonly nanoRepository: Repository<Nano>,
    @InjectRepository(Appmodel) private readonly appmodelRepository: Repository<Appmodel>,
    private readonly chatEngine: EngineChatService,
    private readonly completeEngine: EngineChatService,
    private readonly imageEngine: EngineImageService,
    private readonly authService: AuthService
  ) {

    this.stringMap = new Map<string, [string]>()
    
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
    this.logger.debug(`${openDialogDto.appmodelId} ${openDialogDto.userId}`)
    openDialogDto.appmodelId = openDialogDto.appmodelId || '1'
    // this.logger.debug(openDialogDto.appmodelId)
    // 寻找是否有已知对话，不存在就创建
    let dialog = await this.dialogRepository.findOneBy({userId: openDialogDto.userId, appmodelId: openDialogDto.appmodelId})
    if(!dialog) {
      dialog = await this.dialogRepository.save(openDialogDto)
    }
    // this.logger.debug(JSON.stringify(dialog))
    // 初始化Chatgpt引擎

    const appModel = await this.appmodelRepository.findOneBy({id: parseInt(openDialogDto.appmodelId)})
    // this.logger.debug(appModel)

    // 等待初始化完成
    let result
    if (appModel.mode === MODE_CHAT) {
      result = await this.chatEngine.open(parseInt(openDialogDto.appmodelId), openDialogDto.userId.toString(), openDialogDto.userName)
    } else if (appModel.mode === MODE_COMPLETE) {
      result = await this.completeEngine.open(parseInt(openDialogDto.appmodelId), openDialogDto.userId.toString(), openDialogDto.userName)
    } else if (appModel.mode === MODE_IMAGE) {
      result = await this.imageEngine.open(parseInt(openDialogDto.appmodelId), openDialogDto.userId.toString(), openDialogDto.userName)
    }
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
      return
    }
    dialog.status = '0'
    dialog = await this.dialogRepository.save(dialog)
    return 
  }

  remove(id: number) {
    return `This action removes a #${id} dialog`;
  }

  async prompt(prompt: PromptDto, userId: number){
    // this.logger.debug(`prompt> ${userId}: ${prompt.text}`)

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
    const appModel = await this.appmodelRepository.findOneBy({id: parseInt(dialog.appmodelId)})
    // this.logger.debug(appModel)

    // 等待初始化完成
    let engine 
    if (appModel.mode === MODE_CHAT) {
      engine = this.chatEngine
    } else {
      engine = this.completeEngine
    }
    const result = await engine.prompt(dialog.appmodelId, userId.toString(), prompt.text)

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

  async promptSse(prompt: PromptDto, userId: number, openId: string){
    // this.logger.debug(`prompt> ${userId}: ${prompt.text}`)

    if(!prompt.dialogId || !userId || !prompt.text) {
      this.logger.debug(`promptSse> ${prompt.dialogId}: ${userId}: ${prompt.text}`)
      throw new WsException("输入参数不正确")
    }

    try {
      const security = await this.authService.securityCheck(openId, prompt.text)
      if ( !security) {
        throw new WsException('请不要使用敏感字，否则被封号')
      }
    } catch (error) {
      throw new WsException(error)
    }

    const dialog = await this.dialogRepository.findOneBy({
      id: parseInt(prompt.dialogId), userId: userId
    })
    let nanoDto: CreateNanoDto = {
      userId: userId,
      dialogId: parseInt(prompt.dialogId),
      type: '0', // prompt
      content: prompt.text
    }
    const nano = await this.nanoRepository.save(nanoDto)
    const content = ''
    nanoDto = {
      userId: userId,
      dialogId: parseInt(prompt.dialogId),
      type: '1', // answer
      content: content
    }
    this.stringMap.set(nano.id.toString(), null)
    const nano2 = await this.nanoRepository.save(nanoDto)

    // 调用引擎发送 text
    const appModel = await this.appmodelRepository.findOneBy({id: parseInt(dialog.appmodelId)})
    let engine 
    if (appModel.mode === MODE_CHAT) {
      engine = this.chatEngine
    } else if (appModel.mode === MODE_IMAGE) {
      engine = this.imageEngine
    } else {
      engine = this.completeEngine
    }

    const observable = new Observable<MessageEvent>(ob => {
      ob.next({id: nano.id.toString(), type: 'PROMPT', data: nano.content});
        engine.promptSse(ob, dialog.appmodelId, userId.toString(), nano2.id.toString(), prompt.text)
      })
    // 调用引擎发送 text

    return observable.pipe(
      // tap(data =>{
      //   // 把记录写入数据库
      //   if (data.type === 'DONE') {
          
      //   }
      // }),
      switchMap(async data => {
        if (data.type === 'DONE'){
          const content = data.data.toString()
          nano2.content = content
          if (appModel.mode !== MODE_IMAGE) {
            try {
              const security = await this.authService.securityCheck(openId, prompt.text)
              if ( !security) {
                nano2.content = '** 敏感内容 **'
                this.nanoRepository.save(nano2)
                throw new WsException('请不要讨论敏感内容，否则被封号')
              }
            } catch (error) {
              throw new WsException(error)
            }
          }
          
          this.nanoRepository.save(nano2)
          data.data = null
        }
        return data
      }),
      catchError(error => {throw new WsException(error)})
    )
  }

  async createImage(prompt: PromptDto, userId: number){
    // this.logger.debug(`prompt> ${userId}: ${prompt.text}`)

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
    const appModel = await this.appmodelRepository.findOneBy({id: parseInt(dialog.appmodelId)})
    // this.logger.debug(appModel)

    // 等待初始化完成
    let engine 
    if (appModel.mode === MODE_CHAT) {
      engine = this.chatEngine
    } else {
      engine = this.completeEngine
    }
    const result = await engine.prompt(dialog.appmodelId, userId.toString(), prompt.text)

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


//   /* 分页查询 */
//   async list(reqNanoList: ReqNanoList): Promise<PaginatedDto<Notice>> {
//     let where: FindOptionsWhere<Notice> = {}
//     if (reqNanoList.noticeTitle) {
//         where.noticeTitle = Like(`%${reqNanoList.noticeTitle}%`)
//     }
//     if (reqNanoList.createBy) {
//         where.createBy = Like(`%${reqNanoList.createBy}%`)
//     }
//     if (reqNanoList.noticeType) {
//         where.noticeType = reqNanoList.noticeType
//     }
//     const result = await this.nanoRepository.findAndCount({
//         select: ['noticeId', 'noticeTitle', 'createBy', 'createTime', 'noticeType', 'status'],
//         where,
//         skip: reqNanoList.skip,
//         take: reqNanoList.take,
//         order: {
//             createTime: 'DESC'
//         }
//     })
//     return {
//         rows: result[0],
//         total: result[1]
//     }
// }

// /* 通过id查询 */
// async findById(noticeId: number) {
//     return this.nanoRepository.findOneBy({ noticeId })
// }

// /* 删除 */
// async delete(noticeIdArr: number[] | string[]) {
//     return this.nanoRepository.delete(noticeIdArr)
// }
}
