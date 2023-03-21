/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, Query, Sse, MessageEvent, Logger, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User, UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { Security } from './entities/security.entity';
import { SecurityService } from './security.service';
import { CheckSecurityDto  } from './dto/create-security.dto';
import { MemberAuthGuard } from '@app/common/guards/member-auth.guard';

@ApiTags('微信内容监督接口')
@ApiBearerAuth()
@Controller('security')
export class SecurityController {
    logger  = new Logger(SecurityController.name)
    constructor(
        private readonly securityService: SecurityService
    ) { }

    @Post('check')
    async check(@Body() checkSecurityDto: CheckSecurityDto, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.openId, UserInfoPipe) openId: string) {
        // this.logger.debug(JSON.stringify(createSecurityDto))
        const result = await this.securityService.checkText(openId, checkSecurityDto.text)
        return result
    }
}
