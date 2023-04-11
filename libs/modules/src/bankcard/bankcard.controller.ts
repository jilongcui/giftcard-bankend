
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { BankcardService } from './bankcard.service';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { CreateBankcardDto, CreateBankcardKycDto, UpdateBankcardDto } from './dto/request-bankcard.dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ListBankcardDto, ListMyBankcardDto } from './dto/request-bankcard.dto';
import { Bankcard } from './entities/bankcard.entity';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';

@ApiTags('银行卡')
@ApiBearerAuth()
@Controller('bankcard')
export class BankcardController {
  constructor(private readonly bankcardService: BankcardService) { }

  @Post()
  create(@Body() createBankcardDto: CreateBankcardDto, @UserDec(UserEnum.userId) userId: number) {
    return this.bankcardService.create(createBankcardDto, userId);
  }

  @Post('createWithIdentity')
  createWithIdentity(@Body() createBankcardDto: CreateBankcardKycDto, @UserDec(UserEnum.userId) userId: number) {
    return this.bankcardService.createWithIdentity(createBankcardDto, userId);
  }

  @Post('createWithKyc')
  createWithKyc(@Body() createBankcardDto: CreateBankcardKycDto, @UserDec(UserEnum.userId) userId: number) {
    return this.bankcardService.createWithKyc(createBankcardDto, userId);
  }

  @Post(':id/upgrade')
  upgrade(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
    return this.bankcardService.upgrade(+id, userId);
  }

  /* 银行卡列表 */
  @Get('list')
  @RequiresPermissions('system:bankcard:list')
  @ApiPaginatedResponse(Bankcard)
  async list(@Query() listBankcardDto: ListBankcardDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.bankcardService.list(listBankcardDto, paginationDto);
  }

  /* 我的银行卡列表 */
  @Get('myList')
  @ApiPaginatedResponse(Bankcard)
  async mylist(@Query() listMyBankcardDto: ListMyBankcardDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.bankcardService.mylist(userId, listMyBankcardDto, paginationDto);
  }

  @Get(':id')
  @RequiresRoles(['admin', 'system'])
  findOne(@Param('id') id: string) {
    return this.bankcardService.findOne(+id);
  }

  @Put(':id/invalidate')
  @RequiresRoles(['admin', 'system'])
  invalidate(@Param('id') id: string) {
    return this.bankcardService.invalidate(+id);
  }

  @Patch(':id')
  @RequiresRoles(['admin', 'system'])
  update(@Param('id') id: string, @Body() updateBankcardDto: UpdateBankcardDto) {
    return this.bankcardService.update(+id, updateBankcardDto);
  }

  @Delete(':id')
  @RequiresRoles(['admin', 'system'])
  remove(@Param('id') id: string) {
    return this.bankcardService.deleteOne(+id);
  }
}

