import { Injectable, MessageEvent, Logger } from '@nestjs/common';
import { CompletionPresetDto, CreateCompletionRequestDto, CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';

import { Configuration, OpenAIApi, CreateCompletionRequest, CreateCompletionResponse, CreateChatCompletionRequest, ChatCompletionRequestMessage } from "openai";
import { response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appmodel } from '../appmodel/entities/appmodel.entity';
import { WsException } from '@nestjs/websockets';
import { AxiosResponse } from 'axios';
import { Observable, Subscriber } from 'rxjs';
import { Nano } from '../nano/entities/nano.entity';
import { EngineService } from './engine.interface';

@Injectable()
export class EngineChatService implements EngineService{
  configuration: Configuration
  openai: OpenAIApi
  logger: Logger
  mode: string
  organization: string
  apiKey: string
  history: Map<string, Array<ChatCompletionRequestMessage>>
  presetMap: Map<string, Appmodel>
  
  constructor(
    @InjectRepository(Appmodel) private readonly appmodelRepository: Repository<Appmodel>, 
  ) {
    this.logger = new Logger(EngineChatService.name)
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
    if(responseList.length >= preset.historyLength)
      responseList.shift()
    responseList.push(text +'\n'+ preset.restartText)
    const responses = responseList.join('')
      
    return preset.initText + responses
  }

  generateChatPrompt(preset: CompletionPresetDto, text: string, responseList: ChatCompletionRequestMessage[] ) {
    if(responseList.length >= preset.historyLength)
      responseList.shift()
    responseList.push({"role": "user", "content": text})
    // const responses = responseList.join('')
    const system: ChatCompletionRequestMessage = {"role": "system", "content": preset.initText}
    return [system].concat(responseList)
  }

  async open(appmodelId: number, userId: string, userName: string) {
    let responseList: Array<ChatCompletionRequestMessage>
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
      responseList = new Array<ChatCompletionRequestMessage>()
      this.history.set(appmodelId + '-' + userId, responseList)
    }

    return {cpmlId: 0, object: null,
        text: appModel.preset.welcomeText}
  }

  async prompt(appmodelId: string, userId: string, intext: string) {

    let responseList: Array<ChatCompletionRequestMessage>
    // We get history five nano.
    responseList = this.history.get(appmodelId + '-' + userId)
    // We get promptpreset model
    if (!responseList) {
      throw new WsException("Need open first!")
    }
    const appmodel = this.presetMap.get(appmodelId + '-' + userId)
    if (!appmodel) {
      throw new WsException("Need open first!")
    }
    const text = intext || '';
    if (text.trim().length === 0) {
      throw new WsException("输入文字无效")
    }
    const completionRequest =  (appmodel.preset.completion as CreateChatCompletionRequest)
    // completionRequest.stream = stream
    completionRequest.model = 'gpt-3.5-turbo'
    // this.logger.debug('responseList1 ' + responseList.length)
    completionRequest.messages = this.generateChatPrompt(appmodel.preset, intext, responseList)
    // this.logger.debug(completionRequest.prompt)
    // this.logger.debug(JSON.stringify(completionRequest.messages))
    try {
      const completion = await this.openai.createChatCompletion(completionRequest);
      // this.logger.debug(completion)
      // push new reponse to reponsesList
      if(responseList.length >= appmodel.preset.historyLength)
        responseList.shift()
      responseList.push(completion.data.choices[0].message)
      // this.logger.debug('responseList 2' + responseList.length)
      return {cpmlId: completion.data.id, object: completion.data.object,
              text:completion.data.choices[0].message.content}
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

  async promptSse(ob:Subscriber<MessageEvent>, appmodelId: string, userId: string, nanoId: string, intext: string) {

    let responseList: Array<ChatCompletionRequestMessage>
    // We get history five nano.
    responseList = this.history.get(appmodelId + '-' + userId)
    // We get promptpreset model
    if (!responseList) {
      throw new WsException("Need open first!")
    }
    const appmodel = this.presetMap.get(appmodelId + '-' + userId)
    if (!appmodel) {
      throw new WsException("Need open first!")
    }
    const text = intext || '';
    if (text.trim().length === 0) {
      throw new WsException("输入文字无效")
    }
    
    let length = 2
    let shortStr = []
    const completionRequest =  (appmodel.preset.completion as CreateChatCompletionRequest)
    completionRequest.stream = true
    completionRequest.model = 'gpt-3.5-turbo'
    completionRequest.messages = this.generateChatPrompt(appmodel.preset, intext, responseList)
    // this.logger.debug(JSON.stringify(completionRequest.messages))

    try {
      const res: AxiosResponse<any> = await this.openai.createChatCompletion(completionRequest, { responseType: 'stream' });
      // this.logger.debug(completion)
      // push new reponse to reponsesList
        const strBuffer = []

        res.data.on('data', data => {
          const lines = data.toString().split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
              const message = line.replace(/^data: /, '');
              if (message === '[DONE]') {
                const content = strBuffer.join('')
                if (shortStr.length > 0)
                  ob.next({id: nanoId, data: shortStr.join('')});
                ob.next({id: nanoId, type: 'DONE', data: content});
                ob.complete()
                shortStr = []
                if(responseList.length >= appmodel.preset.historyLength)
                  responseList.shift()
                responseList.push({role: 'assistant', content: content})
                return
              }
              try {
                  // this.logger.debug(message)
                  const parsed = JSON.parse(message);
                  const content = parsed.choices[0].delta.content
                  length += 1
                  strBuffer.push(content)
                  shortStr.push(content)
                  if(length % 3 == 0) {
                    ob.next({id: nanoId, data: shortStr.join('')});
                    shortStr = []
                  }
                  // this.logger.debug(Buffer.from(parsed.chioces[0].text, 'utf-8').toString())
                  // console.log(parsed.choices[0].text);
              } catch(error) {
                  // console.error('Could not JSON parse stream message', message, error);
              }
          }
        })
      // })
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
}

