import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { KycService } from './kyc.service';
import { CreateKycDto, CreateKycInfoDto, ListKycDto, ListMyKycDto } from './dto/create-kyc.dto';
import { NotifyKycStatusDto, UpdateKycDto, UpdateKycStatusDto } from './dto/update-kyc.dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Kyc } from './entities/kyc.entity';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';

@ApiTags('Kyc认证')
@ApiBearerAuth()
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  create(@Body() createKycInfoDto: CreateKycInfoDto, @UserDec(UserEnum.userId) userId: number) {
    return this.kycService.create(createKycInfoDto, userId);
  }

  @Get('list')
  @RequiresRoles(['admin', 'system'])
  @ApiPaginatedResponse(Kyc)
  async list(@Query() listKycDto: ListKycDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.kycService.list(listKycDto, paginationDto);
  }

  /* 我的订单列表 */
  @Get('myList')
  @ApiPaginatedResponse(Kyc)
  async mylist(@Query() listMyKycDto: ListMyKycDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.kycService.mylist(userId, listMyKycDto, paginationDto);
  }

  @Get(':id')
  @RequiresRoles(['admin', 'system'])
  findOne(@Param('id') id: string) {
    return this.kycService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKycDto: UpdateKycDto, @UserDec(UserEnum.userId) userId: number,) {
    return this.kycService.update(+id, updateKycDto, userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateKycDto: UpdateKycStatusDto, @UserDec(UserEnum.userId) userId: number,) {
    return this.kycService.updateStatus(+id, updateKycDto, userId);
  }

  @Post('notify')
  @Keep()
  notify(@Body() noitfyKycDto: NotifyKycStatusDto) {
    return this.kycService.notify(noitfyKycDto);
  }

  @Delete(':id')
  @RequiresRoles(['admin', 'system'])
  remove(@Param('id') id: string) {
    return this.kycService.remove(+id);
  }
}
