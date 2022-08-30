import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { AccountService } from './account.service';
import { CreateAccountDto, ListAccountDto, UpdateAccountDto, UpdateAllAccountDto } from './dto/request-account.dto';
import { Account } from './entities/account.entity';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';

@ApiTags('账户')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  constructor(private readonly activityService: AccountService) { }

  @Post()
  @RequiresRoles(['admin', 'system'])
  async create(@Body() createAccountDto: CreateAccountDto) {
    return await this.activityService.create(createAccountDto);
  }

  @Put(':id')
  @RequiresRoles(['admin', 'system'])
  async updateAll(@Param('id') id: string, @Body() updateAllAccountDto: UpdateAllAccountDto) {
    return await this.activityService.addOrUpdateAll(updateAllAccountDto);
  }

  @Patch(':id')
  @RequiresRoles(['admin', 'system'])
  async update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return await this.activityService.update(+id, updateAccountDto);
  }

  /* 产品列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Account)
  async list(@Query() listAccountDto: ListAccountDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.activityService.list(listAccountDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.activityService.findOne(+id);
  }

  @Delete(':id')
  @RequiresRoles(['admin', 'system'])
  async removeOne(@Param('id') id: string) {
    return await this.activityService.deleteOne(+id);
  }

  @Delete(':ids')
  @RequiresRoles(['admin', 'system'])
  async remove(@Param('ids') ids: string) {
    return await this.activityService.delete(ids.split(','));
  }
}
