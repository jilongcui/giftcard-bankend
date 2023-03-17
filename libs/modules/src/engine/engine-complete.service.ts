import { Injectable, MessageEvent, Logger } from '@nestjs/common';
import { CompletionPresetDto, CreateCompletionRequestDto, CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';

import { Configuration, OpenAIApi, CreateCompletionRequest, CreateCompletionResponse } from "openai";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appmodel } from '../appmodel/entities/appmodel.entity';
import { WsException } from '@nestjs/websockets';
import { AxiosResponse } from 'axios';
import { Observable, Subscriber } from 'rxjs';
import { EngineService } from './engine.interface';
import { AuthService } from '../system/auth/auth.service';

@Injectable()
export class EngineCompleteService implements EngineService{
  configuration: Configuration
  openai: OpenAIApi
  logger: Logger
  mode: string
  organization: string
  apiKey: string
  history: Map<string, Array<string>>
  presetMap: Map<string, Appmodel>
  
  constructor(
    @InjectRepository(Appmodel) private readonly appmodelRepository: Repository<Appmodel>, 
    private readonly authService: AuthService,

  ) {
    this.logger = new Logger(EngineCompleteService.name)
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
    this.history = new Map()
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

  generatePrompt(preset: CompletionPresetDto, text: string, responseList: Array<string> ) {
    if(responseList.length > preset.historyLength)
      responseList.shift()
    responseList.push(text +'\n'+ preset.restartText)
    const responses = responseList.join('')
      
    return preset.initText + responses
  }

  async open(appmodelId: number, userId: string, userName: string) {
    let responseList: Array<string>
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

    // We get history five nano.
    responseList = this.history.get('user' + userId)

    if (!responseList) {
      responseList = new Array<string>()
      this.history.set(appmodelId + '-' + userId, responseList)
    }

    return {cpmlId: 0, object: null,
        text: appModel.preset.welcomeText}
  }

  async prompt(appmodelId: string, userId: string, intext: string) {

    let responseList: Array<string>
    // We get history five nano.
    responseList = this.history.get(appmodelId + '-' + userId)
    // We get promptpreset model
    if (!responseList) {
      throw new WsException("Need open first!")
    }
    const appmodel = this.presetMap.get(appmodelId + '-' + userId)
    if (!appmodel ) {
      throw new WsException("Need open first!")
    }
    const text = intext || '';
    if (text.trim().length === 0) {
      throw new WsException("输入文字无效")
    }
    
    const completionRequest = appmodel.preset.completion as CreateCompletionRequest
    
    // completionRequest.stream = stream
    completionRequest.prompt = this.generatePrompt(appmodel.preset, intext, responseList)
    // this.logger.debug(completionRequest.prompt)
    try {
      const completion = await this.openai.createCompletion(completionRequest);
      // this.logger.debug(completion)
      // push new reponse to reponsesList
      if(responseList.length > appmodel.preset.historyLength)
        responseList.shift()
      responseList.push(completion.data.choices[0].text + '\n' + appmodel.preset.startText)
      return {cpmlId: completion.data.id, object: completion.data.object,
              text:completion.data.choices[0].text}
    } catch(error) {
      // Consider adjusting the error handling logic for your use case
      if(responseList.length > 0)
        responseList.shift()
      if (error.response) {
        this.logger.error(error.response.status, error.response.data);
      } else {
        this.logger.error(`Error with OpenAI API request: ${error.message}`);
      }
      throw new WsException("OpenAI API请求错误")
    }
  }

  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }

  async promptSse(ob:Subscriber<MessageEvent>, openId: string, appmodelId: string, userId: string, nanoId: string, intext: string) {

    let responseList: Array<string>
    // We get history five nano.
    responseList = this.history.get(appmodelId + '-' + userId)
    // We get promptpreset model
    if (!responseList) {
      ob.error("请重新进入此页面!")
      return
    }
    const appmodel = this.presetMap.get(appmodelId + '-' + userId)
    if (!appmodel || !appmodel.preset) {
      ob.error("请重新进入此页面!")
      return
    }
    
    const text = intext || '';
    if (text.trim().length === 0) {
      ob.error("输入文字无效!")
      return 
    }
    
    let length = 50
    let cont = true    

    const completionRequest = appmodel.preset.completion as CreateCompletionRequest
    
    completionRequest.stream = true
    completionRequest.prompt = this.generatePrompt(appmodel.preset, intext, responseList)
    // this.logger.debug(completionRequest.prompt)
    try {
      const res: AxiosResponse<any> = await this.openai.createCompletion(completionRequest, { responseType: 'stream' });
      // this.logger.debug(completion)
      // push new reponse to reponsesList
        const strBuffer = []

        res.data.on('data', async data => {
          if (!cont) return
          const lines = data.toString().split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
              const message = line.replace(/^data: /, '');
              if (message === '[DONE]') {
                const content = strBuffer.join('')
                try {
                  const security = await this.authService.securityCheck(openId, content)
                  if (!security) {
                    cont = false
                    this.logger.debug('** 敏感内容 **')
                    ob.error("不要包含敏感文字")
                    return
                  }
                } catch (error) {
                  ob.error(error.message)
                }
                  
                ob.next({id: nanoId, type: 'DONE', data: content});
                ob.complete()
                // shortStr = []
                if(responseList && responseList.length >= appmodel.preset.historyLength)
                  responseList.shift()
                responseList.push( content + '\n' + appmodel.preset.startText)
                return
              }
              const parsed = JSON.parse(message);
              const content = parsed.choices[0].text || ''

              // ob.next({id: nanoId, data: content});
              length += 1
              strBuffer.push(content)
              ob.next({id: nanoId, data: content});
              // this.logger.debug(content)

              // shortStr.push(content)
              if (length % 100 === 0) {
                let secStart = strBuffer.length-104>0?strBuffer.length-104:0
                const secContent = strBuffer.slice(secStart, secStart+104).join('')
                try {
                  const security= await this.authService.securityCheck(openId, secContent)
                  if (!security) {
                    cont = false
                    this.logger.debug('** 敏感内容 **')
                    ob.error("不要包含敏感文字")
                  }
                } catch (error) {
                  ob.error(error.message)
                }
              }
          }
        })
      // })
    } catch(error) {
      // Consider adjusting the error handling logic for your use case
      if(responseList && responseList.length > 0)
        responseList.shift()
      if (error.response) {
        this.logger.error(error.response.status, error.response.data);
      } else {
        this.logger.error(`Error with OpenAI API request: ${error.message}`);
      }
      this.logger.debug(error)
      ob.error("不要包含敏感文字")
    }
  }
}

