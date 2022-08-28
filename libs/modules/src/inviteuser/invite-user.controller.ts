import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { User, UserEnum } from '@app/common/decorators/user.decorator';
import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InviteUser } from './entities/invite-user.entity';
import { InviteUserService } from './invite-user.service';
@ApiTags('用户邀请')
@ApiBearerAuth()
@Controller('invite')
export class InviteUserController {
    constructor(
        private readonly inviteUserService: InviteUserService
    ) { }

    /* 列出子用户 / flat列表 */
    @Get('children/flat')
    @Public()
    async childrenFlat(@User(UserEnum.userId) userId: number) {
        return await this.inviteUserService.flatChildren(userId);
    }

    /* 列出子用户 / tree列表 */
    @Get('children/tree')
    @Public()
    async childrenTree(@User(UserEnum.userId) userId: number) {
        return await this.inviteUserService.treeChildren(userId);
    }

    /* 获取上级用户 */
    @Get('parent')
    @Public()
    async parent(@User(UserEnum.userId) userId: number) {
        return await this.inviteUserService.parent(userId);
    }

    /* 获取上级用户 */
    @Get('relationship')
    @Public()
    async relationship(@User(UserEnum.userId) userId: number) {
        return await this.inviteUserService.relationship(userId);
    }
}
