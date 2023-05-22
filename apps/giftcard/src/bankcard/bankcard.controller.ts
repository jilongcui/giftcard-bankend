
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseInterceptors, CacheInterceptor, StreamableFile, UploadedFile } from '@nestjs/common';
import { BankcardService } from './bankcard.service';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { CreateBankcardDto, CreateBankcardKycDto, UpdateBankcardCvvCodeDto, UpdateBankcardDto } from './dto/request-bankcard.dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ListBankcardDto, ListMyBankcardDto } from './dto/request-bankcard.dto';
import { Bankcard } from './entities/bankcard.entity';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from '@app/modules/common/excel/excel.service';
import { ApiFile } from '@app/modules/common/upload/upload.controller';

@ApiTags('银行卡')
@ApiBearerAuth()
// @UseInterceptors(CacheInterceptor)
@Controller('bankcard')
export class BankcardController {
  constructor(private readonly bankcardService: BankcardService,
      private readonly excelService: ExcelService) { }

  @Post()
  create(@Body() createBankcardDto: CreateBankcardDto, @UserDec(UserEnum.userId) userId: number) {
    return this.bankcardService.create(createBankcardDto, userId);
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

  /* 导出列表 */
  @RepeatSubmit()
  @Post('export')
  @RequiresPermissions('monitor:bankcard:export')
  @Keep()
  async export(@Body() listBankcardDto: ListBankcardDto, @Body(PaginationPipe) paginationDto: PaginationDto) {
      const { rows } = await this.bankcardService.list(listBankcardDto, paginationDto);
      const file = await this.excelService.export(Bankcard, rows)
      return new StreamableFile(file)
  }

  @Get('userlist')
  @RequiresPermissions('system:bankcard:userlist')
  @ApiPaginatedResponse(Bankcard)
  async userlist(@Query() listBankcardDto: ListBankcardDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.bankcardService.listWithUser(listBankcardDto, paginationDto);
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

  @Put(':id/updateCvvCode')
  // @RequiresRoles(['admin', 'system'])
  updateCvvCode(@Param('id') id: string, @Body() updateCvvCodeDto:UpdateBankcardCvvCodeDto, @UserDec(UserEnum.userId) userId: number) {
    return this.bankcardService.encodeCvvCode(+id, updateCvvCodeDto);
  }

  @Get(':id/readCvvCode')
  // @RequiresRoles(['admin', 'system'])
  getCvvCode(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
    return this.bankcardService.decodeCvvCode(+id, userId);
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

  /* 下载模板 */
  @Post('importTemplate')
  @Keep()
  async importTemplate() {
    const file = await this.excelService.importTemplate(Bankcard)
    return new StreamableFile(file)
  }
  
  /* 用户导入 */
  @RepeatSubmit()
  @Post('importData')
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @RequiresPermissions('system:user:import')
  @UseInterceptors(FileInterceptor('file'))
  async importData(@UploadedFile() file: Express.Multer.File) {
      const data = await this.excelService.import(Bankcard, file)
      await this.bankcardService.insert(data)
  }
}

