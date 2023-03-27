import { OmitType, PartialType } from "@nestjs/swagger"
import { IsOptional } from "class-validator"
import { Email } from "../entities/email.entity"

export class ListEmailDto extends PartialType(OmitType(Email, ['user'] as const)) { }

export class CreateEmailDto {
    from: string
    
    to: string
    
    subject: string
    
    text: string

    @IsOptional()
    filenames?: string[]
}

export class SendEmailDto {
    id: number

    from: string
    
    to: string
    
    subject: string
    
    text: string

    @IsOptional()
    filenames?: string[]
}
