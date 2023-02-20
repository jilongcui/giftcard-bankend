import { Configuration, CreateCompletionRequest } from "openai";

export class CreateEngineDto {}
export interface CreateCompletionRequestDto extends CreateCompletionRequest {
    initText?: string | null
    startText?: string | null
    restartText?: string | null
}

export interface CompletionPresetDto {
    completion: CreateCompletionRequest
    historyLength: number | 10
    initText?: string | null
    startText?: string | null
    restartText?: string | null
}
