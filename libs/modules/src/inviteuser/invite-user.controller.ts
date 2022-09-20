import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { User, UserEnum } from '@app/common/decorators/user.decorator';
import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReqInviteUserListDto } from './dto/request-inviteuser.dto';
import { InviteUser } from './entities/invite-user.entity';
import { InviteUserService } from './invite-user.service';

@ApiTags('用户邀请')
@ApiBearerAuth()
@Controller('invite')
export class InviteUserController {
    constructor(
        private readonly inviteUserService: InviteUserService,
    ) { }

    /* 绑定邀请码 */
    @Post('inviteCode/:code')
    async inviteParent(@Param('code') code: string, @User(UserEnum.userId) userId: number) {
        return await this.inviteUserService.bindInviteCode(userId, code);
    }

    /* 绑定父用户 */
    @Post('inviteParent/:id')
    async bindParent(@Param('id') parentId: number, @User(UserEnum.userId) userId: number) {
        return await this.inviteUserService.bindParent(userId, parentId);
    }

    /* 列出子用户 */
    @Get('tree')
    @Public()
    @ApiDataResponse(typeEnum.objectArr, InviteUser)
    async list(@Query() reqInviteUserListDto: ReqInviteUserListDto) {
        if (reqInviteUserListDto.userName || reqInviteUserListDto.phoneNumber)
            return await this.inviteUserService.findRelation(reqInviteUserListDto);
        else
            return await this.inviteUserService.allTree();
    }

    /* 获取所有关系 */
    @Get('relation')
    @Public()
    @ApiDataResponse(typeEnum.objectArr, InviteUser)
    async relation(@Query('userId') userId: number) {
        return await this.inviteUserService.relation(userId);
    }

    /* 列出子用户 / flat列表 */
    @Get('children/flat')
    @Public()
    async childrenFlat(@Query('userId') userId: number) {
        return await this.inviteUserService.flatChildren(userId);
    }

    /* 列出子用户 / tree列表 */
    @Get('children/tree')
    @Public()
    async childrenTree(@Query('userId') userId: number) {
        return await this.inviteUserService.treeChildren(userId);
    }

    /* 获取上级用户 */
    @Get('parent')
    @Public()
    async parent(@Query('userId') userId: number) {
        return await this.inviteUserService.parent(userId);
    }
}
