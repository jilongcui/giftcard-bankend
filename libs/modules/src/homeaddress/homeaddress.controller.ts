import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { HomeAddressService } from './homeaddress.service';
import { CreateHomeAddressDto, ListHomeAddressDto, ListMyHomeAddressDto } from './dto/create-homeaddress.dto';
import { UpdateDefaultAddressDto, UpdateHomeAddressDto } from './dto/update-homeaddress.dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { HomeAddress } from './entities/homeaddress.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('物理地址管理')
@ApiBearerAuth()
@Controller('homeaddress')
export class HomeAddressController {
  constructor(private readonly homeAddressService: HomeAddressService) {}

  @Post()
  create(@Body() createHomeAddressDto: CreateHomeAddressDto, @UserDec(UserEnum.userId) userId: number) {
    return this.homeAddressService.create(createHomeAddressDto, userId);
  }

  @Get('list')
  @RequiresRoles(['admin', 'system'])
  @ApiPaginatedResponse(HomeAddress)
  async list(@Query() listHomeAddressDto: ListHomeAddressDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.homeAddressService.list(listHomeAddressDto, paginationDto);
  }

  /* 我的订单列表 */
  @Get('mylist')
  @ApiPaginatedResponse(HomeAddress)
  async mylist(@Query() listMyHomeAddressDto: ListMyHomeAddressDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.homeAddressService.mylist(userId, listMyHomeAddressDto, paginationDto);
  }

  @Get(':id')
  @RequiresRoles(['admin', 'system'])
  findOne(@Param('id') id: string) {
    return this.homeAddressService.findOne(+id);
  }

  @Post(':id')
  update(@Param('id') id: string, @Body() updateHomeAddressDto: UpdateHomeAddressDto, @UserDec(UserEnum.userId) userId: number,) {
    return this.homeAddressService.update(+id, updateHomeAddressDto, userId);
  }

  @Post(':id/default')
  updateDefault(@Param('id') id: string, @Body() updateDefaultAddressDto: UpdateDefaultAddressDto) {
    return this.homeAddressService.setDefault(+id, updateDefaultAddressDto.isDefault);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
    return this.homeAddressService.remove(+id);
  }
}
