import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ThrottlerBehindProxyGuard } from '@app/common/guards/throttler-behind-proxy.guard';
import { MagicboxService } from '@app/modules/magicbox/magicbox.service';
import { ListMyMagicboxDto } from '@app/modules/magicbox/dto/request-magicbox.dto';
import { Magicbox } from '@app/modules/magicbox/entities/magicbox.entity';
import { ResListMyMagicboxDto } from '@app/modules/magicbox/dto/response-magicbox.dto';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';

@ApiTags('盲盒合集')
@Controller('mboxCollection')
@UseGuards(ThrottlerBehindProxyGuard)
@ApiBearerAuth()
export class MagicboxCollectionController {
    logger = new Logger(MagicboxCollectionController.name);
    constructor(private readonly magicboxService: MagicboxService) { }

    /* 我的盲盒合集列表 */
    @Get('myList')
    @ApiPaginatedResponse(ResListMyMagicboxDto)
    async myCollectionList(@Query() listMyMagicBoxDto: ListMyMagicboxDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.magicboxService.myCollectionList(userId, listMyMagicBoxDto, null);
    }

    /* 合集下所有盲盒列表 */
    @Get(':id/magicboxes')
    @Public()
    @ApiPaginatedResponse(Magicbox)
    async assetList(@Param('id') id: string, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.magicboxService.listOfCollection(+id, paginationDto);
    }

    /* 合集下我的盲盒列表 */
    @Get(':id/myMagicboxes')
    @ApiPaginatedResponse(Magicbox)
    async myAssetList(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.magicboxService.myListOfCollection(+id, userId, paginationDto);
    }

    @Put('arrangeMagicboxIndexOfCollection/:id/:section')
    @RequiresPermissions('system:magic:reset')
    async arrangeMagicboxIndex(@Param('id') id: string, @Param('section') section: string | '100') {
        return await this.magicboxService.arrangeMagicboxIndexOfCollection(+id, +section)
    }

    @Put('arrangeMagicboxNoOfCollection/:id/:section')
    @RequiresPermissions('system:magic:reset')
    async arrangeMagicboxNoIndex(@Param('id') id: string, @Param('section') section: string | '100') {
        return await this.magicboxService.arrangeMagicboxNoOfCollection(+id, +section)
    }

}

