import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger, Put } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto, ListCollectionDto, ListMyCollectionDto, ListNewCollectionDto, UpdateCollectionDto } from './dto/request-collection.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { DataObj } from '@app/common/class/data-obj.class';
import { Public } from '@app/common/decorators/public.decorator';
import { Collection } from './entities/collection.entity';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from '@app/common/decorators/log.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { Asset } from './entities/asset.entity';

@ApiTags('藏品集合')
@Controller('collection')
@ApiBearerAuth()
export class CollectionController {
  logger = new Logger(CollectionController.name);
  constructor(private readonly collectionService: CollectionService) { }

  /* 新增藏品合集 */
  @Post()
  // @Log({
  //   title: '藏品集合',
  //   businessType: BusinessTypeEnum.insert
  // })
  @RequiresRoles(['admin', 'system'])
  async create(@Body() createCollectionDto: CreateCollectionDto, @UserDec(UserEnum.userId) userId: number) {
    return this.collectionService.create(createCollectionDto);
  }

  /* 藏品合集列表 */
  @Get('list')
  // @Public()
  @ApiPaginatedResponse(Collection)
  async list(@Query() listCollectionDto: ListCollectionDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.collectionService.list(listCollectionDto, paginationDto);
  }

  /* 新的藏品合集列表 */
  @Get('newList')
  // @Public()
  @ApiPaginatedResponse(Collection)
  async newList(@Query() listNewCollectionDto: ListNewCollectionDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.collectionService.newlist(listNewCollectionDto, paginationDto);
  }

  /* 我的藏品列表 */
  @Get('myList')
  @ApiPaginatedResponse(Collection)
  async mylist(@Query() listMyCollectionDto: ListMyCollectionDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.collectionService.mylist(userId, listMyCollectionDto, paginationDto);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.collectionService.findOne(+id);
  }

  @Get(':collectionId/assets')
  @Public()
  @ApiPaginatedResponse(Asset)
  async assetList(@Param('collectionId') id: string, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.collectionService.assetList(+id, paginationDto);
  }

  @Get(':collectionId/myAssets')
  @ApiPaginatedResponse(Asset)
  async myAssetList(@Param('collectionId') id: string, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.collectionService.myAssetList(+id, userId, paginationDto);
  }

  /* 更新产品 */
  // @RepeatSubmit()
  @Put()
  // @Log({
  //   title: '藏品集合',
  //   businessType: BusinessTypeEnum.update
  // })
  @RequiresRoles(['admin', 'system'])
  async update(@Body() collection: UpdateCollectionDto, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
    collection.updateBy = userName
    await this.collectionService.addOrUpdate(collection)
  }

  @Put(':id/openMarket')
  @RequiresRoles(['admin', 'system'])
  async openMarket(@Param('id') id: string) {
    return await this.collectionService.openMarket(+id);
  }

  @Put(':id/closeMarket')
  @RequiresRoles(['admin', 'system'])
  async closeMarket(@Param('id') id: string) {
    return await this.collectionService.closeMarket(+id);
  }

  /* 删除产品 */
  @Delete(':ids')
  @RequiresPermissions('system:collection:remove')
  // @Log({
  //   title: '藏品集合',
  //   businessType: BusinessTypeEnum.delete
  // })
  @RequiresRoles(['admin', 'system'])
  async delete(@Param('ids') ids: string) {
    return await this.collectionService.delete(ids.split(','))
  }

  @Put('resetAssetIndexOfCollection/:id/:section')
  @RequiresPermissions('system:asset:reset')
  async arrangeAssetIndex(@Param('id') id: string, @Param('section') section: string | '100') {
    return await this.collectionService.arrangeAssetIndexOfCollection(+id, +section)
  }
}
