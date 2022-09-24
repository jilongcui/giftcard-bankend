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
import { CreateMagicboxDto, ListMagicboxDto } from '@app/modules/magicbox/dto/request-magicbox.dto';
import { Magicbox } from '@app/modules/magicbox/entities/magicbox.entity';

@ApiTags('盲盒')
@Controller('magicbox')
@UseGuards(ThrottlerBehindProxyGuard)
@ApiBearerAuth()
export class MagicboxController {
    logger = new Logger(MagicboxController.name);
    constructor(private readonly magicboxService: MagicboxService) { }

    /* 新增盲盒 */
    @Post()
    @Log({
        title: '盲盒',
        businessType: BusinessTypeEnum.insert
    })
    @RequiresRoles(['admin', 'system'])
    async create(@Body() createMagicboxDto: CreateMagicboxDto, @UserDec(UserEnum.userId) userId: number) {
        return this.magicboxService.create(createMagicboxDto);
    }

    /* 个人盲盒列表 */
    @Get('myList')
    @ApiPaginatedResponse(Magicbox)
    async myList(@UserDec(UserEnum.userId) userId: number, @Query() listMagicboxDto: ListMagicboxDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.magicboxService.myList(userId, listMagicboxDto, paginationDto);
    }

    /* 后台盲盒列表 */
    @Get('list')
    @Public()
    @ApiPaginatedResponse(Magicbox)
    async list(@Query() listMagicboxDto: ListMagicboxDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        // this.logger.log(JSON.stringify(paginationDto));
        return await this.magicboxService.list(listMagicboxDto, paginationDto);
    }

    /* 首页盲盒推荐 */
    @Get('top')
    @Public()
    @ApiPaginatedResponse(Magicbox)
    async topMagicboxs() {
        return await this.magicboxService.latest();
    }

    @Get(':id')
    @Public()
    async findOne(@Param('id') id: string) {
        return await this.magicboxService.findOne(+id);
    }

    /* 更新 盲盒 */
    // @RepeatSubmit()
    @Put()
    @Log({
        title: '盲盒',
        businessType: BusinessTypeEnum.update
    })
    @RequiresRoles(['admin', 'system'])
    async update(@Body() magicbox: Magicbox) {
        return await this.magicboxService.addOrUpdate(magicbox)
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
}

