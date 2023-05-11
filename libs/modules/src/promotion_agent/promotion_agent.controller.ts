import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PromotionAgentService } from './promotion_agent.service';
import { CreatePromotionAgentDto, ListMyPromotionAgentDto, ListPromotionAgentDto } from './dto/create-promotion_agent.dto';
import { UpdatePromotionAgentDto, UpdatePromotionAgentStatusDto } from './dto/update-promotion_agent.dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PromotionAgent } from './entities/promotion_agent.entity';

@Controller('promotion-agent')
export class PromotionAgentController {
  constructor(private readonly promotionAgentService: PromotionAgentService) {}

  @Post()
  create(@Body() createPromotionAgentInfoDto: CreatePromotionAgentDto, @UserDec(UserEnum.userId) userId: number) {
    return this.promotionAgentService.create(createPromotionAgentInfoDto, userId);
  }

  @Get('list')
  @RequiresRoles(['admin', 'system'])
  @ApiPaginatedResponse(PromotionAgent)
  async list(@Query() listPromotionAgentDto: ListPromotionAgentDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.promotionAgentService.list(listPromotionAgentDto, paginationDto);
  }

  /* 我的列表 */
  @Get('myList')
  @ApiPaginatedResponse(PromotionAgent)
  async mylist(@Query() listMyPromotionAgentDto: ListMyPromotionAgentDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.promotionAgentService.mylist(userId, listMyPromotionAgentDto, paginationDto);
  }

  @Get(':id')
  @RequiresRoles(['admin', 'system'])
  findOne(@Param('id') id: string) {
    return this.promotionAgentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromotionAgentDto: UpdatePromotionAgentDto, @UserDec(UserEnum.userId) userId: number,) {
    return this.promotionAgentService.update(+id, updatePromotionAgentDto, userId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updatePromotionAgentDto: UpdatePromotionAgentStatusDto, @UserDec(UserEnum.userId) userId: number,) {
    return this.promotionAgentService.updateStatus(+id, updatePromotionAgentDto, userId);
  }

  @Delete(':id')
  @RequiresRoles(['admin', 'system'])
  remove(@Param('id') id: string) {
    return this.promotionAgentService.remove(+id);
  }
  
}
