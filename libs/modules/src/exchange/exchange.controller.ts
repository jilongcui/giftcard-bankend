import { Controller, Get, Post, Body, Patch, Param, Delete, Query, StreamableFile } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Exchange } from './entities/exchange.entity';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ListExchangeDto } from './dto/create-exchange.dto';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ExcelService } from '../common/excel/excel.service';

@ApiTags('币币兑换')
@ApiBearerAuth()
@Controller('exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService,
    private readonly excelService: ExcelService) {}
  @Get('list')
    @Public()
    @ApiPaginatedResponse(Exchange)
    async list(@Query() listExchangeDto: ListExchangeDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return this.exchangeService.list(listExchangeDto, paginationDto);
    }

    /* 导出列表 */
    @RepeatSubmit()
    @Post('export')
    @RequiresPermissions('monitor:withdraw:export')
    @Keep()
    async export(@Body() listExchangeDto: ListExchangeDto, @Body(PaginationPipe) paginationDto: PaginationDto) {
        const { rows } = await this.exchangeService.list(listExchangeDto, paginationDto);
        const file = await this.excelService.export(Exchange, rows)
        return new StreamableFile(file)
    }

    @Get('mylist')
    @ApiPaginatedResponse(Exchange)
    async mylist(@UserDec(UserEnum.userId) userId: number, @Query() listExchangeDto: ListExchangeDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return this.exchangeService.mylist(userId, listExchangeDto, paginationDto);
    }

}
