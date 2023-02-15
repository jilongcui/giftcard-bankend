import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MemberInfoService } from './member-info.service';
import { CreateMemberDto, ListMemberDto } from './dto/request-member.dto';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { MemberInfo } from './entities/member-info.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateMemberInfoDto, ListMemberInfoDto } from './dto/request-member-info.dto';

@ApiTags('会员等级信息')
@ApiBearerAuth()
@Controller('memberInfo')
export class MemberInfoController {
  constructor(private readonly memberInfoService: MemberInfoService) {}

  @Post()
  @RequiresPermissions('system:member:create')
  create(@Body() createMemberDto: CreateMemberInfoDto, @UserDec(UserEnum.userId) userId: number) {
    return this.memberInfoService.create(createMemberDto, userId);
  }

  @Get()
  @RequiresPermissions('system:member:list')
  findAll() {
    return this.memberInfoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberInfoService.findOne(+id);
  }

  /* 会员列表 */
  @Get('list')
  @RequiresPermissions('system:member:list')
  @ApiPaginatedResponse(MemberInfo)
  async list(@Query() listMemberDto: ListMemberInfoDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.memberInfoService.list(listMemberDto, paginationDto);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
  //   return this.memberInfoService.update(+id, updateMemberDto);
  // }

  @Delete(':id')
  @RequiresPermissions('system:member:list')
  remove(@Param('id') id: string) {
    return this.memberInfoService.remove(+id);
  }
}
