import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString } from "class-validator"
import moment from "moment"

export class ResInviteUserDto {
    rank: number
    inviteCount: number
    userName: string
}
