import { Injectable, Logger } from '@nestjs/common';
import { CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';

import { Configuration, OpenAIApi } from "openai";

@Injectable()
export class EngineService {
  configuration: Configuration
  openai: OpenAIApi
  logger: Logger
  model: string
  organization: string
  apiKey: string
  temperature: number
  
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

  async prompt(userId: string, intext: string) {

    if (!this.configuration.apiKey) {
      return {code: 500, message:"OpenAI API key not configured, please follow instructions in README.md",}
    }

    const text = intext || '';
    if (text.trim().length === 0) {
      return {code: 400, mssage: "Please enter a valid prompt",}
    }
    try {
      const completion = await this.openai.createCompletion({
        model: this.model,
        temperature: this.temperature,
        prompt: text,
        max_tokens: 1000,
        user: "YaYaUser"+userId
      });
      this.logger.debug(completion.data)
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

