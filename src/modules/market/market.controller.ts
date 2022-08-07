import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { AssetRecordService } from './asset-record.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { UserEnum } from 'src/common/decorators/user.decorator';
import { User as UserDec } from 'src/common/decorators/user.decorator';


@Controller('market')
export class MarketController {
  constructor(
    private readonly marketService: MarketService,
    private readonly assetRecordService: AssetRecordService
  ) { }

  /* 资产出售 */
  @Put(':id')
  upAsset(@Param('id') id: string, price: number, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName) userName: string) {
    return this.marketService.upAsset(+id, price, userId, userName);
  }

  /* 资产撤回 */
  @Put(':id')
  downAsset(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName) userName: string) {
    return this.marketService.buyAsset(+id, userId, userName);
  }

  /* 资产购买 */
  @Put(':id')
  buyAsset(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName) userName: string) {
    return this.marketService.downAsset(+id, userId, userName);
  }

  /* 交易记录 */
  @Get('asset/:id/records')
  records(@Param('id') id: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return this.assetRecordService.list(id, paginationDto);
  }

  // /* 网站首页推荐 */
  // @Get('asset')
  // assets() {
  //   return this.assetRecordService.list();
  // }

  // /* 市场首页推荐 */
  // @Get('collection')
  // collections() {
  //   return this.assetRecordService.findAll();
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.marketService.remove(+id);
  // }
}

