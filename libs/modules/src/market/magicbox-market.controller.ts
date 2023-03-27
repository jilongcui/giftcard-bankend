import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { UserEnum } from '@app/common/decorators/user.decorator';
import { UserDec } from '@app/common/decorators/user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';

import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { ThrottlerBehindProxyGuard } from '@app/common/guards/throttler-behind-proxy.guard';
import { Magicbox } from '../magicbox/entities/magicbox.entity';
import { FlowMagicboxDto } from '../magicbox/dto/request-magicbox.dto';
import { MagicboxMarketService } from './magicbox-market.service';
import { MagicboxService } from '../magicbox/magicbox.service';
import { MagicboxRecord } from '../magicbox/entities/magicbox-record.entity';
import { MagicboxRecordService } from '../magicbox/magicbox-record.service';

@ApiTags('盲盒市场')
@ApiBearerAuth()
@UseGuards(ThrottlerBehindProxyGuard)
@Controller('market')
export class MagicboxMarketController {
    constructor(
        private readonly magicboxService: MagicboxService,
        private readonly magicboxMarketService: MagicboxMarketService,
        private readonly magicboxRecordService: MagicboxRecordService,
    ) { }

    /* 资产出售 */
    @Put('magicbox/:id/sell')
    async upMagicbox(@Param('id') id: string, @Body('price') price: number, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName, UserInfoPipe) userName: string) {
        return await this.magicboxMarketService.upMagicbox(+id, price, userId, userName);
    }

    /* 资产下架 */
    @Put('magicbox/:id/down')
    async downMagicbox(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName, UserInfoPipe) userName: string) {
        return await this.magicboxMarketService.downMagicbox(+id, userId, userName);
    }

    /* 资产转移 */
    @Put('magicbox/:id/transfer/:toUserName')
    async transferMagicbox(@Param('id') id: string, @Param('toUserName') toUserName: string, @UserDec(UserEnum.userId) userId: number) {
        return await this.magicboxMarketService.transferMagicbox(+id, userId, toUserName);
    }

    /* 资产批量转移 */
    @Put('magicboxs/:ids/transfer/:toUserName')
    async transferMagicboxArray(@Param('ids') ids: string, @Param('toUserName') toUserName: string, @UserDec(UserEnum.userId) userId: number) {
        return await this.magicboxMarketService.transferMagicboxs(ids.split(','), userId, toUserName);
    }

    // /* 资产购买 */
    // @Put('buy/:id')
    // async buyMagicbox(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName) userName: string) {
    //   return await this.marketService.downMagicbox(+id, userId, userName);
    // }

    /* 资产交易记录 */
    @Get('magicbox/:id/records')
    @Public()
    @ApiPaginatedResponse(MagicboxRecord)
    async records(@Param('id') id: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.magicboxRecordService.list(id, paginationDto);
    }

    /* 盲盒二级市场数据流 */
    @Get('magicbox/flow')
    @Public()
    @ApiPaginatedResponse(Magicbox)
    async listMagicboxs(@Query() flowMagicboxDto: FlowMagicboxDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.magicboxService.flow(flowMagicboxDto, paginationDto);
    }

    // /* 市场首页推荐 */
    // @Get('collection')
    // async collections() {
    //   return this.magicboxRecordService.findAll();
    // }

    // @Delete(':id')
    // async remove(@Param('id') id: string) {
    //   return this.marketService.remove(+id);
    // }
}

