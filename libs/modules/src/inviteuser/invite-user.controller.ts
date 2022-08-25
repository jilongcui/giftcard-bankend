import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
@ApiTags('用户邀请')
@ApiBearerAuth()
@Controller('invite')
export class InviteUserController {

}
