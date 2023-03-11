import { Injectable, MessageEvent, Logger } from '@nestjs/common';
import { CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';

import { Configuration, OpenAIApi, CreateImageRequest } from "openai";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appmodel } from '../appmodel/entities/appmodel.entity';
import { WsException } from '@nestjs/websockets';
import { Observable, Subscriber } from 'rxjs';
import { EngineService } from './engine.interface';
import { UploadService } from '../common/upload/upload.service';
import strRandom from 'string-random';

@Injectable()
export class EngineImageService implements EngineService{
  configuration: Configuration
  openai: OpenAIApi
  logger: Logger
  mode: string
  organization: string
  apiKey: string
  presetMap: Map<string, Appmodel>
  
  constructor(
    @InjectRepository(Appmodel) private readonly appmodelRepository: Repository<Appmodel>, 
    private readonly uploadService: UploadService
  ) {
    this.logger = new Logger(EngineImageService.name)
    this.organization = process.env.OPENAI_ORGANIZATION
    this.apiKey = process.env.OPENAI_APIKEY
    let engine = 'DIALOG'
    if (engine === 'PICTURE') {
      this.mode = "text-davinci-003"
    } else {
      this.mode = "text-davinci-003"
    }
    this.configuration = new Configuration({
      apiKey: this.apiKey,
      organization: this.organization,
    });
    this.openai = new OpenAIApi(this.configuration);
    this.presetMap = new Map()
  }

  setMode(mode: string) {
    this.mode = mode;
  }

  create(createEngineDto: CreateEngineDto) {
    return 'This action adds a new engine';
  }

  findAll() {
    return `This action returns all engine`;
  }

  findOne(id: number) {
    return `This action returns a #${id} engine`;
  }

  update(id: number, updateEngineDto: UpdateEngineDto) {
    return `This action updates a #${id} engine`;
  }

  remove(id: number) {
    return `This action removes a #${id} engine`;
  }

  async open(appmodelId: number, userId: string, userName: string) {
    if (!this.configuration.apiKey) {
      throw new WsException('OpenAI API key not configured!')
    }

    if(!userName)
      userName = '用户' + userId
    const appModel = await this.appmodelRepository.findOneBy({id: appmodelId})
    // this.logger.debug(appModel)

    if(!appModel) {
      throw new WsException('App model is not exist.')
    }
    const initText = appModel.preset.initText.replace('${username}', userName)
    appModel.preset.initText = initText
    appModel.preset.completion.user = 'YaYaUser'+appmodelId + '-' +userId, 
    // We save appmodel 
    this.presetMap.set(appmodelId + '-' +userId, appModel)


    return {cpmlId: 0, object: null,
        text: appModel.preset.welcomeText}
  }

  async prompt(appmodelId: string, userId: string, intext: string) {

    const appmodel = this.presetMap.get(appmodelId + '-' + userId)
    if (!appmodel) {
      throw new WsException("Need open first!")
    }
    const text = intext || '';
    if (text.trim().length === 0) {
      throw new WsException("输入文字无效")
    }
    const completionRequest =  (appmodel.preset.completion as CreateImageRequest)
    // completionRequest.stream = stream
    // this.logger.debug('responseList1 ' + responseList.length)
    completionRequest.prompt = text
    // this.logger.debug(completionRequest.prompt)
    // this.logger.debug(JSON.stringify(completionRequest.messages))
    try {
      const completion = await this.openai.createImage(completionRequest);
      // this.logger.debug(completion)
      // push new reponse to reponsesList
      this.logger.debug(completion.data.data[0].b64_json)
      // 把生成的图片方到服务器上，然后返回url
      // 还是把身材的图片直接以base64的方式传递给前端呢
      // this.logger.debug('responseList 2' + responseList.length)
      return {cpmlId: completion.data.created, object: null,
              text: completion.data.data[0].b64_json}
    } catch(error) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        this.logger.error(error.response.status, error.response.data);
      } else {
        this.logger.error(`Error with OpenAI API request: ${error.message}`);
      }
      throw new WsException("OpenAI API请求错误")
    }
  }

  async promptSse(ob:Subscriber<MessageEvent>, appmodelId: string, userId: string, nanoId: string, intext: string)
  {
    const appmodel = this.presetMap.get(appmodelId + '-' + userId)
    if (!appmodel) {
      ob.error("请重新进入此页面")
    }
    const text = intext || '';
    if (text.trim().length === 0) {
      ob.error("输入文字无效")
    }
    const completionRequest =  (appmodel.preset.completion as CreateImageRequest)
    // completionRequest.stream = stream
    // this.logger.debug('responseList1 ' + responseList.length)
    completionRequest.prompt = text
    // this.logger.debug(completionRequest.prompt)
    // this.logger.debug(JSON.stringify(completionRequest.messages))
    try {
      const completion = await this.openai.createImage(completionRequest);
      // this.logger.debug(completion)
      // push new reponse to reponsesList
      // this.logger.debug(completion.data.data[0].b64_json)

      // 把生成的图片方到服务器上，然后返回url
      // 还是把身材的图片直接以base64的方式传递给前端呢

      const contents = []
      for(let i=0; i< completion.data.data.length; i++) {
        const fileName = strRandom(8).toLowerCase() + '.png'
        const fullName = 'created_images' + '/' +userId + '/' + fileName
        const url = await this.uploadService.uploadBase64ToCos(fullName, completion.data.data[i].b64_json)
        const content = `![${fileName}](${url})`
        contents.push(content)
        ob.next({id: nanoId, data: content});
      }
      
      ob.next({id: nanoId, type: 'DONE', data: contents.join()});
      ob.complete()
      
      // this.logger.debug('responseList 2' + responseList.length)
      
    } catch(error) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        this.logger.error(error.response.status, error.response.data);
      } else {
        this.logger.error(`Error with OpenAI API request: ${error.message}`);
      }
      ob.error("请求错误：不要包含敏感文字")
    }
  }
}

