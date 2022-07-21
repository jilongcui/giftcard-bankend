import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger, Put } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto, ListCollectionDto, UpdateCollectionDto } from './dto/request-collection.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DataObj } from 'src/common/class/data-obj.class';
import { Public } from 'src/common/decorators/public.decorator';
import { Collection } from './entities/collection.entity';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from 'src/common/decorators/log.decorator';
import { RepeatSubmit } from 'src/common/decorators/repeat-submit.decorator';
import { User as UserDec, UserEnum } from 'src/common/decorators/user.decorator';
import { UserInfoPipe } from 'src/common/pipes/user-info.pipe';

@ApiTags('藏品')
@Controller('collection')
@ApiBearerAuth()
export class CollectionController {
  logger = new Logger(CollectionController.name);
  constructor(private readonly collectionService: CollectionService) { }

  /* 新增产品 */
  @Post()
  @Log({
    title: '藏品',
    businessType: BusinessTypeEnum.insert
  })
  async create(@Body() createCollectionDto: CreateCollectionDto, @UserDec(UserEnum.userId) userId: number) {
    return this.collectionService.create(createCollectionDto);
  }

  /* 产品列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Collection)
  async list(@Query() listCollectionDto: ListCollectionDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.collectionService.list(listCollectionDto, paginationDto);
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.collectionService.findOne(+id);
  }

  /* 更新产品 */
  @RepeatSubmit()
  @Put()
  @Log({
    title: '藏品',
    businessType: BusinessTypeEnum.update
  })
  async update(@Body() collection: CreateCollectionDto, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
    collection.updateBy = userName
    await this.collectionService.addOrUpdate(collection)
  }

  /* 删除产品 */
  @Delete(':ids')
  @RequiresPermissions('system:collection:remove')
  @Log({
    title: '藏品',
    businessType: BusinessTypeEnum.delete
  })
  async delete(@Param('ids') ids: string) {
    return await this.collectionService.delete(ids.split(','))
  }
}
