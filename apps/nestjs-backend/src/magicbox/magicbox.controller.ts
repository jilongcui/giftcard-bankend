import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from '@app/common/decorators/log.decorator';
import { User as UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ThrottlerBehindProxyGuard } from '@app/common/guards/throttler-behind-proxy.guard';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { MagicboxService } from '@app/modules/magicbox/magicbox.service';
import { ListMagicboxDto, ListMyMagicboxDto } from '@app/modules/magicbox/dto/request-magicbox.dto';
import { Magicbox } from '@app/modules/magicbox/entities/magicbox.entity';

@ApiTags('盲盒')
@Controller('magicbox')
@UseGuards(ThrottlerBehindProxyGuard)
@ApiBearerAuth()
export class MagicboxController {
    logger = new Logger(MagicboxController.name);
    constructor(private readonly magicboxService: MagicboxService) { }

    /* 后台盲盒列表 */
    @Get('list')
    @RequiresRoles(['admin', 'system'])
    @ApiPaginatedResponse(Magicbox)
    async list(@Query() listMagicboxDto: ListMagicboxDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        // this.logger.log(JSON.stringify(paginationDto));
        return await this.magicboxService.list(listMagicboxDto, paginationDto);
    }

    /* 我的单个盲盒列表 */
    @Get('myList')
    @ApiPaginatedResponse(Magicbox)
    async myList(@Query() listMyMagicboxDto: ListMyMagicboxDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.magicboxService.myList(userId, listMyMagicboxDto, paginationDto);
    }

    /* 首页盲盒推荐 */
    @Get('top')
    @Public()
    @ApiPaginatedResponse(Magicbox)
    async topMagicboxs() {
        return await this.magicboxService.latest();
    }

    /* 获取单个盲盒 */
    @Get(':id')
    @Public()
    async findOne(@Param('id') id: string) {
        return await this.magicboxService.findOne(+id);
    }

    /* 我的盲盒详情 */
    @Get('myOne/:id')
    async myOne(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number,) {
        return await this.magicboxService.findMyOne(+id, userId);
    }

    /* 删除 盲盒 */
    @Delete(':ids')
    @RequiresPermissions('system:magicbox:remove')
    @Log({
        title: '盲盒',
        businessType: BusinessTypeEnum.delete
    })
    @RequiresRoles(['admin', 'system'])
    async delete(@Param('ids') ids: string) {
        return await this.magicboxService.delete(ids.split(','))
    }

    @Put(':id/open')
    @Log({
        title: '开盲盒',
        businessType: BusinessTypeEnum.update
    })
    async open(@Param('id') id: number, @UserDec(UserEnum.userId) userId: number,) {
        return await this.magicboxService.open(id, userId)
    }
}

