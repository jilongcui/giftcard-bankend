import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger, Put, UseGuards } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateAssetDto, FlowAssetDto, ListAssetDto, UpdateAssetDto } from './dto/request-asset.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { DataObj } from '@app/common/class/data-obj.class';
import { Public } from '@app/common/decorators/public.decorator';
import { Asset } from './entities/asset.entity';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from '@app/common/decorators/log.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { User as UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { ThrottlerBehindProxyGuard } from '@app/common/guards/throttler-behind-proxy.guard';

@ApiTags('资产')
@Controller('asset')
@UseGuards(ThrottlerBehindProxyGuard)
@ApiBearerAuth()
export class AssetController {
  logger = new Logger(AssetController.name);
  constructor(private readonly assetService: AssetService) { }

  /* 新增资产 */
  @Post()
  @Log({
    title: ' 资产',
    businessType: BusinessTypeEnum.insert
  })
  async create(@Body() createAssetDto: CreateAssetDto, @UserDec(UserEnum.userId) userId: number) {
    return this.assetService.create(createAssetDto);
  }

  /* 个人资产列表 */
  @Get('myList')
  @ApiPaginatedResponse(Asset)
  async myList(@UserDec(UserEnum.userId) userId: number, @Query() listAssetDto: ListAssetDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.assetService.myList(userId, listAssetDto, paginationDto);
  }

  /* 资产列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Asset)
  async list(@Query() listAssetDto: ListAssetDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    // this.logger.log(JSON.stringify(paginationDto));
    return await this.assetService.list(listAssetDto, paginationDto);
  }

  /* 首页推荐资产 */
  @Get('top')
  @Public()
  @ApiPaginatedResponse(Asset)
  async topAssets() {
    return await this.assetService.latest();
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.assetService.findOne(+id);
  }

  /* 更新 资产 */
  @RepeatSubmit()
  @Put()
  @Log({
    title: ' 资产',
    businessType: BusinessTypeEnum.update
  })
  async update(@Body() asset: Asset) {
    return await this.assetService.addOrUpdate(asset)
  }


  /* 删除 资产 */
  @Delete(':ids')
  @RequiresPermissions('system:asset:remove')
  @Log({
    title: ' 资产',
    businessType: BusinessTypeEnum.delete
  })
  async delete(@Param('ids') ids: string) {
    return await this.assetService.delete(ids.split(','))
  }
}
