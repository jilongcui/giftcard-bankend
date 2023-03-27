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
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import replicate from "node-replicate"
import { CreateMidjourneyRequest } from './dto/create-midjourney.dto';

@Injectable()
export class EngineMidjourneyService implements EngineService{
  configuration: Configuration
  openai: OpenAIApi
  logger: Logger
  mode: string
  organization: string
  apiKey: string
  
  constructor(
    @InjectRepository(Appmodel) private readonly appmodelRepository: Repository<Appmodel>, 
    @InjectRedis() private readonly redis: Redis,
    private readonly uploadService: UploadService,
  ) {
    this.logger = new Logger(EngineMidjourneyService.name)
    this.organization = process.env.OPENAI_ORGANIZATION
    this.apiKey = process.env.REPLICATE_API_TOKEN
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
    if (!this.apiKey) {
      throw new WsException('Midjourney API key not configured!')
    }

    const appModel = await this.appmodelRepository.findOneBy({id: appmodelId})
    // this.logger.debug(appModel)

    if(!appModel || !appModel.preset) {
      throw new WsException('App model is not exist.')
    }
    // We save appmodel 
    await this.redis.set('Appmodel:' + appmodelId + ':' +userId, JSON.stringify(appModel))


    return {cpmlId: 0, object: null,
        text: appModel.preset.welcomeText}
  }

  async prompt(appmodelId: string, userId: string, intext: string) {

    const appmodel:Appmodel = JSON.parse(await this.redis.get('Appmodel:' +appmodelId + ':' + userId))
    if (!appmodel || !appmodel.preset) {
      throw new WsException("请重新进入本页面")
      return
    }
    const text = intext || '';
    if (text.trim().length === 0) {
      throw new WsException("输入文字无效")
    }
    const completionRequest =  (appmodel.preset.completion as CreateMidjourneyRequest)
    completionRequest.prompt = appmodel.preset.initText + text

    completionRequest.prompt = text
    // this.logger.debug(completionRequest.prompt)
    // this.logger.debug(JSON.stringify(completionRequest.messages))
    try {
      const model = appmodel.modelVersion
      const completion = await replicate.run(model, completionRequest)
      return {cpmlId: completion.data.created, object: null,
              text: completion.JSON.stringify(completion)}
    } catch(error) {
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        this.logger.error(error.response.status, error.response.data);
      } else {
        this.logger.error(`Error with Midjourney API request: ${error.message}`);
      }
      throw new WsException("OpenAI API请求错误")
    }
  }

  async promptSse(ob:Subscriber<MessageEvent>, openId: string, appmodelId: string, userId: string, nanoId: string, intext: string)
  {
    const appmodel:Appmodel = JSON.parse(await this.redis.get('Appmodel:' +appmodelId + ':' + userId))
    if (!appmodel || !appmodel.preset) {
      throw new WsException("请重新进入本页面")
      return
    }
    const text = intext || '';
    if (text.trim().length === 0) {
      ob.error("输入文字无效")
    }
    const completionRequest =  (appmodel.preset.completion as CreateMidjourneyRequest)
    completionRequest.prompt = appmodel.preset.initText + text
    // this.logger.debug(completionRequest.prompt)
    // this.logger.debug(JSON.stringify(completionRequest.messages))
    try {
      const model = appmodel.modelVersion

      const completion = await replicate.run(model, completionRequest)
      // 还是把身材的图片直接以base64的方式传递给前端呢

      const contents = []
      for(let i=0; i< completion.length; i++) {
        // const fileName = strRandom(8).toLowerCase() + '.png'
        // const fullName = 'created_images' + '/' +userId + '/' + fileName
        // const url = await this.uploadService.uploadBase64ToCos(fullName, completion.data.data[i].b64_json)
        const url = completion[i]
        const content = `![](${url})`
        // this.logger.debug(content)
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

