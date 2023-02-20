import { Configuration, CreateCompletionRequest } from "openai";

export class CreateEngineDto {}
export interface CreateCompletionRequestDto extends CreateCompletionRequest {
    initText?: string | null
    startText?: string | null
    restartText?: string | null
}

export interface CreatePromptRequestDto {
    completionRequest: CreateCompletionRequest
    initText?: string | null
    startText?: string | null
    restartText?: string | null
}
