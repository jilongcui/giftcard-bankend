import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { AccountFlowService } from './account-flow.service';
import { CreateAccountFlowDto, ListAccountFlowDto, ListMyAccountFlowDto,  } from './dto/request-account-flow.dto';
import { Account } from './entities/account.entity';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';

@ApiTags('账户流水')
@ApiBearerAuth()
@Controller('account-flow')
export class AccountFlowController {
  constructor(private readonly accountFlowService: AccountFlowService) { }

  @Post()
  @RequiresRoles(['admin', 'system'])
  async create(@Body() createAccountDto: CreateAccountFlowDto) {
    return await this.accountFlowService.create(createAccountDto);
  }


  /* 账户列表 */
  @Get('list')
  @RequiresRoles(['admin', 'system'])
  @ApiPaginatedResponse(Account)
  async list(@Query() listAccountDto: ListAccountFlowDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.accountFlowService.list(listAccountDto, paginationDto);
  }

  /* 账户列表 */
  @Get('mylist')
  @ApiPaginatedResponse(Account)
  async mylist(@Query() listAccountDto: ListMyAccountFlowDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.accountFlowService.mylist(listAccountDto, userId, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.accountFlowService.findOne(+id);
  }

  @Delete(':id')
  @RequiresRoles(['admin', 'system'])
  async removeOne(@Param('id') id: string) {
    return await this.accountFlowService.deleteOne(+id);
  }

  @Delete(':ids')
  @RequiresRoles(['admin', 'system'])
  async remove(@Param('ids') ids: string) {
    return await this.accountFlowService.delete(ids.split(','));
  }

}
