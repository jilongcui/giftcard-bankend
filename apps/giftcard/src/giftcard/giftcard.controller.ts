
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseInterceptors, CacheInterceptor, StreamableFile, UploadedFile } from '@nestjs/common';
import { GiftcardService } from './giftcard.service';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { CreateGiftcardDto, CreateGiftcardKycDto, ListOnlineGiftcardDto, UpdateGiftcardDto } from './dto/request-giftcard.dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ListGiftcardDto, ListMyGiftcardDto } from './dto/request-giftcard.dto';
import { Giftcard } from './entities/giftcard.entity';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { ApiFile } from '@app/modules/pdf/pdf.controller';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from '@app/modules/common/excel/excel.service';

@ApiTags('礼品卡')
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@Controller('giftcard')
export class GiftcardController {
  constructor(private readonly giftcardService: GiftcardService,
    private readonly excelService: ExcelService) { }

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

  /* 导出列表 */
  @RepeatSubmit()
  @Post('export')
  @RequiresPermissions('monitor:giftcard:export')
  @Keep()
  async export(@Query() listGiftcardDto: ListGiftcardDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
      const { rows } = await this.giftcardService.list(listGiftcardDto, paginationDto);
      const file = await this.excelService.export(Giftcard, rows)
      return new StreamableFile(file)
  }

  @Get('userlist')
  @RequiresPermissions('system:giftcard:userlist')
  @ApiPaginatedResponse(Giftcard)
  async userlist(@Query() listGiftcardDto: ListGiftcardDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.giftcardService.listWithUser(listGiftcardDto, paginationDto);
  }

  @Get('online')
  @Public()
  @ApiPaginatedResponse(Giftcard)
  async online(@Query() listGiftcardDto: ListOnlineGiftcardDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.giftcardService.onlineList(listGiftcardDto, paginationDto);
  }

  /* 我的银行卡列表 */
  @Get(['mylist','myList'])
  @ApiPaginatedResponse(Giftcard)
  async mylist(@Query() listMyGiftcardDto: ListMyGiftcardDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.giftcardService.mylist(userId, listMyGiftcardDto, paginationDto);
  }

  @Get(':id')
  // @RequiresRoles(['admin', 'system'])
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

  /* 下载模板 */
  @Post('importTemplate')
  @Keep()
  async importTemplate() {
    const file = await this.excelService.importTemplate(Giftcard)
    return new StreamableFile(file)
  }
  
  /* 银行卡导入 */
  @RepeatSubmit()
  @Post('importData')
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @RequiresPermissions('system:user:import')
  @UseInterceptors(FileInterceptor('file'))
  async importData(@UploadedFile() file: Express.Multer.File) {
      const data = await this.excelService.import(Giftcard, file)
      await this.giftcardService.insert(data)
  }
}

