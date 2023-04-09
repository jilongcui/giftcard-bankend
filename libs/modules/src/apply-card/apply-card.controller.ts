import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApplyCardService } from './apply-card.service';
import { CreateApplyCardDto, ListMyApplyCardDto } from './dto/create-apply-card.dto';
import { ListApplyCardDto, UpdateApplyCardDto } from './dto/update-apply-card.dto';
import { ApplyCard } from './entities/apply-card.entity';

@ApiTags("申请银行卡")
@ApiBearerAuth()
@Controller('apply-card')
export class ApplyCardController {
  constructor(private readonly applyCardService: ApplyCardService) {}

  @Post()
  create(@Body() createApplyCardDto: CreateApplyCardDto, @UserDec(UserEnum.userId) userId: number) {
    return this.applyCardService.create(createApplyCardDto, userId);
  }

  /* 银行卡列表 */
  @Get('list')
  @ApiPaginatedResponse(ApplyCard)
  async list(@Query() listApplyCardDto: ListApplyCardDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.applyCardService.list(listApplyCardDto, paginationDto);
  }

  /* 我的银行卡列表 */
  @Get('myList')
  @ApiPaginatedResponse(ApplyCard)
  async mylist(@Query() listMyApplyCardDto: ListMyApplyCardDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.applyCardService.mylist(userId, listMyApplyCardDto, paginationDto);
  }

  @Get(':id')
  @RequiresRoles(['admin', 'system'])
  findOne(@Param('id') id: string) {
    return this.applyCardService.findOne(+id);
  }

  @Patch(':id')
  @RequiresRoles(['admin', 'system'])
  update(@Param('id') id: string, @Body() updateApplyCardDto: UpdateApplyCardDto) {
    return this.applyCardService.update(+id, updateApplyCardDto);
  }

  @Delete(':id')
  @RequiresRoles(['admin', 'system'])
  remove(@Param('id') id: string) {
    return this.applyCardService.deleteOne(+id);
  }
}
