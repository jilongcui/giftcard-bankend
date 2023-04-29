
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseInterceptors, CacheInterceptor } from '@nestjs/common';
import { GiftcardService } from './giftcard.service';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { CreateGiftcardDto, CreateGiftcardKycDto, UpdateGiftcardDto } from './dto/request-giftcard.dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ListGiftcardDto, ListMyGiftcardDto } from './dto/request-giftcard.dto';
import { Giftcard } from './entities/giftcard.entity';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';

@ApiTags('礼品卡')
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@Controller('giftcard')
export class GiftcardController {
  constructor(private readonly giftcardService: GiftcardService) { }

  @Post()
  create(@Body() createGiftcardDto: CreateGiftcardDto, @UserDec(UserEnum.userId) userId: number) {
    return this.giftcardService.create(createGiftcardDto, userId);
  }

  /* 银行卡列表 */
  @Get('list')
  // @RequiresPermissions('system:giftcard:list')
  @ApiPaginatedResponse(Giftcard)
  async list(@Query() listGiftcardDto: ListGiftcardDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.giftcardService.list(listGiftcardDto, paginationDto);
  }

  @Get('userlist')
  @RequiresPermissions('system:giftcard:userlist')
  @ApiPaginatedResponse(Giftcard)
  async userlist(@Query() listGiftcardDto: ListGiftcardDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.giftcardService.listWithUser(listGiftcardDto, paginationDto);
  }

  /* 我的银行卡列表 */
  @Get(['mylist','myList'])
  @ApiPaginatedResponse(Giftcard)
  async mylist(@Query() listMyGiftcardDto: ListMyGiftcardDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.giftcardService.mylist(userId, listMyGiftcardDto, paginationDto);
  }

  @Get(':id')
  @RequiresRoles(['admin', 'system'])
  findOne(@Param('id') id: string) {
    return this.giftcardService.findOne(+id);
  }

  // @Put(':id/invalidate')
  // // @RequiresRoles(['admin', 'system'])
  // invalidate(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
  //   return this.giftcardService.invalidate(+id, userId);
  // }

  @Put(':id/upmarket')
  // @RequiresRoles(['admin', 'system'])
  upmarket(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
    return this.giftcardService.upmarket(+id, userId);
  }

  @Put(':id/downmarket')
  // @RequiresRoles(['admin', 'system'])
  downmarket(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
    return this.giftcardService.downmarket(+id, userId);
  }

  @Patch(':id')
  @RequiresRoles(['admin', 'system'])
  update(@Param('id') id: string, @Body() updateGiftcardDto: UpdateGiftcardDto) {
    return this.giftcardService.update(+id, updateGiftcardDto);
  }

  @Delete(':id')
  @RequiresRoles(['admin', 'system'])
  remove(@Param('id') id: string) {
    return this.giftcardService.deleteOne(+id);
  }
}

