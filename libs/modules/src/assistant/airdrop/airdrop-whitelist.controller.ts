import { Controller, Get, Post, Body, Patch, Param, Delete, Query, StreamableFile, UploadedFile, UseInterceptors, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { AirdropWhitelistService } from './airdrop-whitelist.service';
import { CreateAirdropWhitelistDto, ListAirdropWhitelistDto, UpdateAirdropWhitelistDto } from './dto/request-airdrop-whitelist.dto';
import { AirdropWhitelist } from './entities/airdrop-whitelist.entity';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from '@app/modules/common/excel/excel.service';
import { ApiFile } from '@app/modules/common/upload/upload.controller';

@ApiTags('空投白名单')
@ApiBearerAuth()
@Controller('airdropWhitelist')
export class AirdropWhitelistController {
  logger = new Logger(AirdropWhitelistController.name)
  constructor(
    private readonly airdropService: AirdropWhitelistService,
    private readonly excelService: ExcelService
  ) { }

  @Post()
  async create(@Body() createAirdropWhitelistDto: CreateAirdropWhitelistDto) {
    return await this.airdropService.create(createAirdropWhitelistDto);
  }

  @Get('list')
  @ApiPaginatedResponse(AirdropWhitelist)
  async list(@Query() listAirdropWhitelistDto: ListAirdropWhitelistDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.airdropService.list(listAirdropWhitelistDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.airdropService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAirdropWhitelistDto: UpdateAirdropWhitelistDto) {
    return await this.airdropService.update(+id, updateAirdropWhitelistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.airdropService.remove(+id);
  }

  /* 导出空投记录 */
  @Post('export')
  @RequiresPermissions('assistant:airdrop:export')
  @Keep()
  async export(@Body() reqWhitelistDto: ListAirdropWhitelistDto, @Body(PaginationPipe) paginationDto: PaginationDto,) {
    const { rows } = await this.airdropService.list(reqWhitelistDto, paginationDto)
    const file = await this.excelService.export(AirdropWhitelist, rows)
    return new StreamableFile(file)
  }

  /* 下载模板 */
  @Post('importTemplate')
  @Keep()
  async importTemplate() {
    const file = await this.excelService.importTemplate(AirdropWhitelist)
    return new StreamableFile(file)
  }

  /* 空投白名单导入 */
  @Post('importData')
  @ApiConsumes('multipart/form-data')
  @ApiFile()
  @RequiresPermissions('assistant:airdrop:import')
  @UseInterceptors(FileInterceptor('file'))
  async importData(@UploadedFile() file: Express.Multer.File) {
    const data = await this.excelService.import(AirdropWhitelist, file)
    await this.airdropService.insert(data)
  }
}
