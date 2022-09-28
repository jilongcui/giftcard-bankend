import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { AssetRecordService } from './asset-record.service';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { UserEnum } from '@app/common/decorators/user.decorator';
import { User as UserDec } from '@app/common/decorators/user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { AssetRecord } from './entities/asset-record.entity';
import { Asset } from '../collection/entities/asset.entity';
import { FlowAssetDto } from '../collection/dto/request-asset.dto';
import { AssetService } from '../collection/asset.service';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { ThrottlerBehindProxyGuard } from '@app/common/guards/throttler-behind-proxy.guard';
import { Magicbox } from '../magicbox/entities/magicbox.entity';
import { MagicboxService } from '../magicbox/magicbox.service';
import { FlowMagicboxDto } from '../magicbox/dto/request-magicbox.dto';

@ApiTags('藏品市场')
@ApiBearerAuth()
@UseGuards(ThrottlerBehindProxyGuard)
@Controller('market')
export class MarketController {
  constructor(
    private readonly marketService: MarketService,
    private readonly assetService: AssetService,
    private readonly magicboxService: MagicboxService,
    private readonly assetRecordService: AssetRecordService
  ) { }

  /* 资产出售 */
  @Put('asset/:id/sell')
  async upAsset(@Param('id') id: string, @Body('price') price: number, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName, UserInfoPipe) userName: string) {
    return await this.marketService.upAsset(+id, price, userId, userName);
  }

  /* 资产下架 */
  @Put('asset/:id/down')
  async downAsset(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName, UserInfoPipe) userName: string) {
    return await this.marketService.downAsset(+id, userId, userName);
  }

  /* 资产转移 */
  @Put('asset/:id/transfer/:toUserName')
  async transferAsset(@Param('id') id: string, @Param('toUserName') toUserName: string, @UserDec(UserEnum.userId) userId: number) {
    return await this.marketService.transferAsset(+id, userId, toUserName);
  }

  /* 资产批量转移 */
  @Put('assets/:ids/transfer/:toUserName')
  async transferAssetArray(@Param('ids') ids: string, @Param('toUserName') toUserName: string, @UserDec(UserEnum.userId) userId: number) {
    return await this.marketService.transferAssets(ids.split(','), userId, toUserName);
  }

  // /* 资产购买 */
  // @Put('buy/:id')
  // async buyAsset(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName) userName: string) {
  //   return await this.marketService.downAsset(+id, userId, userName);
  // }

  /* 资产交易记录 */
  @Get('asset/:id/records')
  @Public()
  @ApiPaginatedResponse(AssetRecord)
  async records(@Param('id') id: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.assetRecordService.list(id, paginationDto);
  }

  /* 资产二级市场数据流 */
  @Get('asset/flow')
  @Public()
  @ApiPaginatedResponse(Asset)
  async listAssets(@Query() flowAssetDto: FlowAssetDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.assetService.flow(flowAssetDto, paginationDto);
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
  //   return this.assetRecordService.findAll();
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return this.marketService.remove(+id);
  // }
}

