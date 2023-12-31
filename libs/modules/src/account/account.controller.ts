import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { AccountService } from './account.service';
import { CreateAccountDto, ExhangeAccountDto, ListAccountDto, ListMyAccountDto, TransferAccountDto, UpdateAccountDto, UpdateAllAccountDto } from './dto/request-account.dto';
import { Account } from './entities/account.entity';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';

@ApiTags('资金账户')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) { }

  @Post()
  @RequiresRoles(['admin', 'system'])
  async create(@Body() createAccountDto: CreateAccountDto) {
    return await this.accountService.create(createAccountDto);
  }

  @Put(':id')
  @RequiresRoles(['admin', 'system'])
  async updateAll(@Param('id') id: string, @Body() updateAllAccountDto: UpdateAllAccountDto) {
    return await this.accountService.addOrUpdateAll(updateAllAccountDto);
  }

  @Put(':id/freeze')
  @RequiresRoles(['admin', 'system'])
  async freeze(@Param('id') id: string) {
    return await this.accountService.freeze(+id);
  }

  @Put(':id/release')
  @RequiresRoles(['admin', 'system'])
  async release(@Param('id') id: string) {
    return await this.accountService.release(+id);
  }

  @Patch(':id')
  @RequiresRoles(['admin', 'system'])
  async update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return await this.accountService.update(+id, updateAccountDto);
  }

  /* 账户列表 */
  @Get('list')
  @RequiresRoles(['admin', 'system'])
  @ApiPaginatedResponse(Account)
  async list(@Query() listAccountDto: ListAccountDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.accountService.list(listAccountDto, paginationDto);
  }

  /* 账户列表 */
  @Get('mylist')
  @ApiPaginatedResponse(Account)
  async mylist(@Query() listAccountDto: ListMyAccountDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.accountService.mylist(listAccountDto, userId, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.accountService.findOne(+id);
  }

  @Delete(':id')
  @RequiresRoles(['admin', 'system'])
  async removeOne(@Param('id') id: string) {
    return await this.accountService.deleteOne(+id);
  }

  @Delete(':ids')
  @RequiresRoles(['admin', 'system'])
  async remove(@Param('ids') ids: string) {
    return await this.accountService.delete(ids.split(','));
  }

  @Post('exchange')
  async exchange(@Body() exchangeAccountDto: ExhangeAccountDto, @UserDec(UserEnum.userId) userId: number) {
    return await this.accountService.exchange(exchangeAccountDto, userId);
  }

  @Post('transfer')
  async transfer(@Body() transferAccountDto: TransferAccountDto, @UserDec(UserEnum.userId) userId: number) {
    return await this.accountService.transfer(transferAccountDto, userId);
  }
}
