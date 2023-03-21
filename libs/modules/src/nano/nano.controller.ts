/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, Query, Sse, MessageEvent, Logger } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '@app/common/decorators/public.decorator';
import { User, UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { NanoService } from './nano.service';
import { CreateNanoDto, ListNanoDto, MyListNanoDto, } from './dto/create-nano.dto';
import {Observable, map, interval} from 'rxjs';
import { Keep } from '@app/common/decorators/keep.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { Nano } from './entities/nano.entity';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { BusinessTypeEnum, Log } from '@app/common/decorators/log.decorator';

@ApiTags('闲语接口')
@ApiBearerAuth()
@Controller('nano')
export class NanoController {
    logger  = new Logger(NanoController.name)
    constructor(
        private readonly nanoService: NanoService
    ) { }

    /* 分页查询Nano */
    @Get('list')
    @ApiPaginatedResponse(Nano)
    async list(@Query() listNanoDto: ListNanoDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.nanoService.list(listNanoDto, paginationDto);
    }

    /* 我的Nano */
    @Get("myList")
    @ApiPaginatedResponse(Nano)
    async myList(@Query() listNanoDto: MyListNanoDto, @UserDec(UserEnum.userId) userId: number,
        @Query(PaginationPipe) paginationDto: PaginationDto
    ) {
        return await this.nanoService.mylist(listNanoDto, userId, paginationDto)
    }

    /* 删除Nano */
    @Delete(':nanoIds')
    @RequiresPermissions('system:nano:remove')
    @Log({
        title: '删除',
        businessType: BusinessTypeEnum.delete
    })
    async delete(@Param('nanoIds') nanoIds: string) {
        await this.nanoService.delete(nanoIds.split(','))
    }
}
