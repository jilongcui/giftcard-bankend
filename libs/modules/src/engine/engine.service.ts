import { Injectable, Logger } from '@nestjs/common';
import { CreateCompletionRequestDto, CreateEngineDto, CreatePromptRequestDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';

import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { response } from 'express';

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
  
  constructor( ) {
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

  generatePrompt(completeRequest: CreatePromptRequestDto, responseList: Array<string> ) {
    if(responseList.length > 10)
      responseList.shift()
    responseList.push(completeRequest.completionRequest.prompt.toString() +'\n'+ completeRequest.restartText)
    const responses = responseList.join('')
    return completeRequest.initText + responses
  }

  async open(userId: string) {
    let responseList: Array<string>
    if (!this.configuration.apiKey) {
      return {code: 500, message:"OpenAI API key not configured, please follow instructions in README.md",}
    }

    const initText = `下面是一段和AI助理吖吖之间的对话，吖吖是非常聪明、乐于助人还有创造力的女助理。

    Human: 你好，我是用户${userId}，你是谁呢？
    AI: 我是小荷智联公司的AI助理吖吖。今天有什么需要帮忙的吗？
    Human:`

    const promptRequest: CreatePromptRequestDto ={
      completionRequest: null,
      initText: initText,
      startText: 'HUMAN:',
      restartText: 'AI:',
    }

    // We get history five nano.
    responseList = this.history.get('user' + userId)

    if (!responseList) {
      responseList = new Array<string>()
      responseList.push(promptRequest.initText)
      this.history.set('user' + userId, responseList)
    }

    return {code:200, data: {cpmlId: 0, object: null,
        text:'我是小荷智联公司的AI助理吖吖。今天有什么需要帮忙的吗？'}}

  }
  async prompt(userId: string, intext: string) {

    let responseList: Array<string>
    if (!this.configuration.apiKey) {
      return {code: 500, message:"OpenAI API key not configured, please follow instructions in README.md",}
    }

    const text = intext || '';
    if (text.trim().length === 0) {
      return {code: 400, mssage: "Please enter a valid prompt",}
    }
    // const initText2 = `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.

    // Human: Hello, who are you?
    // AI: I am an AI created by OpenAI. How can I help you today?
    // Human:`
    const initText = `下面是一段和AI助理吖吖之间的对话，吖吖是非常聪明、乐于助人还有创造力的女助理。

    Human: 你好，我是用户${userId}，你是谁呢？
    AI: 我是小荷智联公司的AI助理吖吖。今天有什么需要帮忙的吗？
    Human:`
    const completionRequest: CreateCompletionRequest = {
      model: this.model,
      prompt: text,
      max_tokens: 300,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      temperature: 0.9,
      top_p: 1,
      user: "YaYaUser" + userId,
      stop: [" Human:"," AI:"],
      
    }

    const promptRequest: CreatePromptRequestDto ={
      completionRequest: completionRequest,
      initText: initText,
      startText: 'HUMAN:',
      restartText: 'AI:',
    }
    // We get history five nano.
    responseList = this.history.get('user' + userId)

    if (!responseList) {
      responseList = new Array<string>()
      responseList.push(promptRequest.initText)
      this.history.set('user' + userId, responseList)
    }
    completionRequest.prompt = this.generatePrompt(promptRequest, responseList)
    this.logger.debug(completionRequest.prompt)
    try {
      const completion = await this.openai.createCompletion(completionRequest);
      this.logger.debug(completion.data)
      // push new reponse to reponsesList
      if(responseList.length > 10)
        responseList.shift()
      responseList.push(completion.data.choices[0].text + '\n' + promptRequest.startText)
      return {code:200, data: {cpmlId: completion.data.id, object: completion.data.object,
        text:completion.data.choices[0].text}}
    } catch(error) {
      // Consider adjusting the error handling logic for your use case
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

