import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Put, Query, forwardRef } from '@nestjs/common';
import { VersionService } from './version.service';
import { CreateVersionDto, ListVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ExcelService } from '../common/excel/excel.service';
import { PaymentService } from '../payment/payment.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {Version} from './entities/version.entity'

@ApiTags('版本')
@ApiBearerAuth()
@Controller('version')
export class VersionController {
  constructor(
    private readonly versionService: VersionService,
    ) {}

  @Post()
  @RequiresRoles(['admin', 'system'])
  create(@Body() createVersionDto: CreateVersionDto) {
    return this.versionService.create(createVersionDto);
  }

  @Put(':id/valid')
  async valide(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
    const updateVersionDto: UpdateVersionDto ={
      status: '0'
    }
    return await this.versionService.update(+id, updateVersionDto);
  }

  @Put(':id/invalid')
  async invalid(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
    const updateVersionDto: UpdateVersionDto ={
      status: '0'
    }
    return await this.versionService.update(+id, updateVersionDto);
  }

  @Patch(':id')
  @RequiresRoles(['admin', 'system'])
  async update(@Param('id') id: string, @Body() updateVersionDto: UpdateVersionDto) {
    return await this.versionService.update(+id, updateVersionDto);
  }

  /* 订单列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Version)
  async list(@Query() listVersionDto: ListVersionDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.versionService.list(listVersionDto, paginationDto);
  }

  @Get('latest')
  @Public()
  async latest(@Param('id') id: string) {
    return await this.versionService.findLatestOne();
  }
  
  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return await this.versionService.findOne(+id);
  }

  @Delete(':ids')
  @RequiresRoles(['admin', 'system'])
  async remove(@Param('ids') ids: string) {
    return await this.versionService.delete(ids.split(','));
  }
}
