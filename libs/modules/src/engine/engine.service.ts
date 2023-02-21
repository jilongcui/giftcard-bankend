import { Injectable, Logger } from '@nestjs/common';
import { CompletionPresetDto, CreateCompletionRequestDto, CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';

import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appmodel } from '../appmodel/entities/appmodel.entity';

@Injectable()
export class EngineService {
  configuration: Configuration
  openai: OpenAIApi
  logger: Logger
  model: string
  organization: string
  apiKey: string
  temperature: number
  history: Map<string, Array<string>>
  presetMap: Map<string, Appmodel>
  
  constructor(
    @InjectRepository(Appmodel) private readonly appmodelRepository: Repository<Appmodel>, 
  ) {
    this.logger = new Logger(EngineService.name)
    this.organization = process.env.OPENAI_ORGANIZATION
    this.apiKey = process.env.OPENAI_APIKEY
    let engine = 'DIALOG'
    if (engine === 'PICTURE') {
      this.model = "text-davinci-003"
      this.temperature = 0.1
    } else {
      this.model = "text-davinci-003"
      this.temperature = 0.1
    }
    this.configuration = new Configuration({
      apiKey: this.apiKey,
      organization: this.organization,
    });
    this.openai = new OpenAIApi(this.configuration);
    this.history = new Map()
    this.presetMap = new Map()
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
      return {code: 500, data:"OpenAI API key not configured, please follow instructions in README.md",}
    }

    if(!userName)
      userName = '用户' + userId
    const appModel = await this.appmodelRepository.findOneBy({id: appmodelId})
    // this.logger.debug(appModel)

    if(!appModel) {
      return {code: 500, data:"App Model is not exist.",}
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
      this.history.set('user' + userId, responseList)
    }

    return {code:200, data: {cpmlId: 0, object: null,
        text: appModel.preset.welcomeText}}
  }

  async prompt(appmodelId: string, userId: string, intext: string) {

    let responseList: Array<string>
    // We get history five nano.
    responseList = this.history.get('user' + userId)
    // We get promptpreset model
    if (!responseList) {
      return {code: 500, message:"Need open first!",}
    }
    const appmodel = this.presetMap.get(appmodelId + '-' + userId)
    if (!appmodel) {
      return {code: 500, message:"Need open first!",}
    }
    const text = intext || '';
    if (text.trim().length === 0) {
      return {code: 400, mssage: "Please enter a valid prompt",}
    }
    
    const completionRequest = appmodel.preset.completion
    
    completionRequest.prompt = this.generatePrompt(appmodel.preset, intext, responseList)
    this.logger.debug(completionRequest.prompt)
    try {
      const completion = await this.openai.createCompletion(completionRequest);
      // this.logger.debug(completion.data)
      // push new reponse to reponsesList
      if(responseList.length > 10)
        responseList.shift()
      responseList.push(completion.data.choices[0].text + '\n' + appmodel.preset.startText)
      return {code:200, data: {cpmlId: completion.data.id, object: completion.data.object,
        text:completion.data.choices[0].text}}
    } catch(error) {
      // Consider adjusting the error handling logic for your use case
      if(responseList.length > 0)
        responseList.shift()
      if (error.response) {
        this.logger.error(error.response.status, error.response.data);
        return {code: error.response.status, message: error.response.data}
      } else {
        this.logger.error(`Error with OpenAI API request: ${error.message}`);
        return {code: 500, message: `Error with OpenAI API request`}
      }
    }
  }
}

