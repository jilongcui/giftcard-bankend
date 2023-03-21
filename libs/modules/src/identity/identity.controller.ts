import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReqIdentify3ElementDto } from './dto/req-identity-3e.dto';
import { IdentityService } from './identity.service';
import { User, UserEnum } from '@app/common/decorators/user.decorator';
import { Identity } from './entities/identity.entity';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { ReqIdentityList } from './dto/req-identity-list.dto';

@Controller('identity')
@ApiTags("真实身份认证")
@ApiBearerAuth()
export class IdentityController {
    constructor(
        private readonly identityService: IdentityService
    ) { }

    /* 身份3要素认证 */
    // 手机号 身份证号 名称

    @Get('list')
    @ApiPaginatedResponse(Identity)
    list(@Query(PaginationPipe) reqAddressList: ReqIdentityList) {
        return this.identityService.list(reqAddressList)
    }

    @Post()
    async identityWith3Element(@Body() reqId3Element: ReqIdentify3ElementDto, @User(UserEnum.userId) userId: number) {
        return this.identityService.identityWith3Element(reqId3Element.mobile, reqId3Element.cardId, reqId3Element.realName, userId);
    }
}
