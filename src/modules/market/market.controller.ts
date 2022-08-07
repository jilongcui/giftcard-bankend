import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { MarketService } from './market.service';
import { AssetRecordService } from './asset-record.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { UserEnum } from 'src/common/decorators/user.decorator';
import { User as UserDec } from 'src/common/decorators/user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { AssetRecord } from './entities/asset-record.entity';

@ApiTags('市场')
@ApiBearerAuth()
@Controller('market')
export class MarketController {
  constructor(
    private readonly marketService: MarketService,
    private readonly assetRecordService: AssetRecordService
  ) { }

  /* 资产出售 */
  async upAsset(@Param('id') id: string, price: number, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName) userName: string) {
    return await this.marketService.upAsset(+id, price, userId, userName);
  }

  /* 资产撤回 */
  @Put(':id')
  async downAsset(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName) userName: string) {
    return await this.marketService.buyAsset(+id, userId, userName);
  }

  /* 资产购买 */
  @Put(':id')
  async buyAsset(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName) userName: string) {
    return await this.marketService.downAsset(+id, userId, userName);
  }

  /* 资产交易记录 */
  @Get('asset/:id/records')
  @Public()
  @ApiPaginatedResponse(AssetRecord)
  async records(@Param('id') id: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.assetRecordService.list(id, paginationDto);
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

