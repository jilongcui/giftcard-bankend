import { Body, CacheInterceptor, CacheTTL, Controller, Get, Inject, Param, Post, Put, Query, StreamableFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ConfirmWithdrawDto, CreateWithdrawDto, ListMyWithdrawDto, ListWithdrawDto, QueryBankCardInfoDto, ReqBankCertifyDto, ReqWithdrawDto, WithdrawWithCardDto } from '../fund/dto/request-fund.dto';
import { WithdrawService } from './withdraw.service';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { Withdraw } from '../fund/entities/withdraw.entity';
import { Keep } from '@app/common/decorators/keep.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { ExcelService } from '../common/excel/excel.service';

@ApiTags('33资金提现管理')
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@Controller('fund33/withdraw')
export class WithdrawController {
    constructor(
        private readonly withdrawService: WithdrawService,
        private readonly excelService: ExcelService,
    ) { }

    @Post()
    async createWithdraw(@Body() creatWithdrawDto: CreateWithdrawDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.withdrawService.createWithdrawRequest(creatWithdrawDto, userId);
    }

    @Post('confirm')
    @RequiresRoles(['admin', 'system'])
    async confirmWithdraw(@Body() confirmWithdrawDto: ConfirmWithdrawDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.withdrawService.confirmWithdrawRequest(confirmWithdrawDto, userId);
    }

    /* 资金提现列表 */
    @Get('list')
    @CacheTTL(60)
    @ApiPaginatedResponse(PaginatedDto<Withdraw>)
    async list(@Query() listWithdrawDto: ListWithdrawDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.withdrawService.list(listWithdrawDto, paginationDto);
    }

    /* 导出资金提现列表 */
    @RepeatSubmit()
    @Post('export')
    @RequiresPermissions('monitor:withdraw:export')
    @Keep()
    async exportOrder(listWithdrawDto: ListWithdrawDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        const { rows } = await this.withdrawService.list(listWithdrawDto, paginationDto);
        const file = await this.excelService.export(Withdraw, rows)
        return new StreamableFile(file)
    }

    /* 我的资金提现列表 */
    @CacheTTL(60)
    @Get('mylist')
    @ApiPaginatedResponse(PaginatedDto<Withdraw>)
    async mylist(@Query() listMyWithdrawDto: ListMyWithdrawDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.withdrawService.mylist(userId, listMyWithdrawDto, paginationDto);
    }

    @Put(':id/cancel')
    async cancel(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
        return await this.withdrawService.cancel(+id, userId);
    }

    @Put(':id/fail')
    @RequiresRoles(['admin', 'system'])
    async fail(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
        return await this.withdrawService.fail(+id, userId);
    }

    @Get(':id')
    @ApiDataResponse(typeEnum.object, Withdraw)
    async findOne(@Param('id') id: string) {
        return await this.withdrawService.findOne(+id);
    }

}
