import { Controller, Get, Post, Body, Patch, Param, Delete, Query, StreamableFile } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Transfer } from './entities/transfer.entity';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ListTransferDto } from './dto/create-transfer.dto';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ExcelService } from '../common/excel/excel.service';

@ApiTags('内部转币')
@ApiBearerAuth()
@Controller('transfer')
export class TransferController {
    constructor(private readonly transferService: TransferService,
    private readonly excelService: ExcelService) {}
    @Get('list')
    @Public()
    @ApiPaginatedResponse(Transfer)
    async list(@Query() listTransferDto: ListTransferDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return this.transferService.list(listTransferDto, paginationDto);
    }

    /* 导出列表 */
    @RepeatSubmit()
    @Post('export')
    @RequiresPermissions('monitor:transfer:export')
    @Keep()
    async export(@Body() listTransferDto: ListTransferDto, @Body(PaginationPipe) paginationDto: PaginationDto) {
        const { rows } = await this.transferService.list(listTransferDto, paginationDto);
        const file = await this.excelService.export(Transfer, rows)
        return new StreamableFile(file)
    }

    @Get('mylist')
    @ApiPaginatedResponse(Transfer)
    async mylist(@Query() listTransferDto: ListTransferDto, @Query(PaginationPipe) paginationDto: PaginationDto, @UserDec(UserEnum.userId) userId: number) {
        return this.transferService.mylist(userId, listTransferDto, paginationDto);
    }

}
