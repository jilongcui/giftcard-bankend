import { Configuration, CreateChatCompletionRequest, CreateCompletionRequest } from "openai";

export class CreateEngineDto {}
export interface CreateCompletionRequestDto extends CreateCompletionRequest {
    initText?: string | null
    startText?: string | null
    restartText?: string | null
}

export interface CompletionPresetDto {
    completion: CreateCompletionRequest | CreateChatCompletionRequest | any
    historyLength: number | 10
    welcomeText?: string | null
    initText?: string | null
    startText?: string | null
    restartText?: string | null
}
