
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BankcardService } from './bankcard.service';
import { User as UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { CreateBankcardDto, UpdateBankcardDto } from './dto/request-bankcard.dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ListOrderDto, ListMyOrderDto } from '../order/dto/request-order.dto';
import { Order } from '../order/entities/order.entity';

@ApiTags('银行卡')
@ApiBearerAuth()
@Controller('bankcard')
export class BankcardController {
  constructor(private readonly bankcardService: BankcardService) { }

  @Post()
  create(@Body() createBankcardDto: CreateBankcardDto, @UserDec(UserEnum.userId) userId: number) {
    return this.bankcardService.create(createBankcardDto, userId);
  }

  /* 银行卡列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Order)
  async list(@Query() listOrderDto: ListOrderDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.bankcardService.list(listOrderDto, paginationDto);
  }

  /* 我的银行卡列表 */
  @Get('myList')
  @ApiPaginatedResponse(Order)
  async mylist(@Query() listMyOrderDto: ListMyOrderDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.bankcardService.mylist(userId, listMyOrderDto, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bankcardService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBankcardDto: UpdateBankcardDto) {
    return this.bankcardService.update(+id, updateBankcardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bankcardService.deleteOne(+id);
  }
}

