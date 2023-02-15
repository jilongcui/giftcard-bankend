import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto, ListMemberDto } from './dto/request-member.dto';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { Member } from './entities/member.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('会员等级')
@ApiBearerAuth()
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @RequiresPermissions('system:member:create')
  create(@Body() createMemberDto: CreateMemberDto, @UserDec(UserEnum.userId) userId: number) {
    return this.memberService.create(createMemberDto, userId);
  }

  // @Get()
  // @RequiresPermissions('system:member:list')
  // findAll() {
  //   return this.memberService.findAll();
  // }

  /* 会员列表 */
  @Get('list')
  @RequiresPermissions('system:member:list')
  @ApiPaginatedResponse(Member)
  async list(@Query() listMemberDto: ListMemberDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.memberService.list(listMemberDto, paginationDto);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
  //   return this.memberService.update(+id, updateMemberDto);
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(+id);
  }

  @Delete(':id')
  @RequiresPermissions('system:member:list')
  remove(@Param('id') id: string) {
    return this.memberService.remove(+id);
  }
}
