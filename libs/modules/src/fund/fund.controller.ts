import { Body, Controller, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User as UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ConfirmWithdrawDto, CreateWithdrawDto, ListMyWithdrawDto, ListWithdrawDto, QueryBankCardInfoDto, ReqBankCertifyDto, ReqWithdrawDto, WithdrawWithCardDto } from './dto/request-fund.dto';
import { FundService } from './fund.service';
import { QueryBankCardResponse } from './dto/response-fund.dto';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Withdraw } from './entities/withdraw.entity';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PaginationDto } from '@app/common/dto/pagination.dto';

@ApiTags('资金管理')
@ApiBearerAuth()
@Controller('fund')
export class FundController {
    constructor(
        private readonly fundService: FundService
    ) { }

    @Post('withdraw')
    async createWithdraw(@Body() creatWithdrawDto: CreateWithdrawDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.createWithdrawRequest(creatWithdrawDto, userId);
    }

    @Post('confirmWithdraw')
    @RequiresRoles(['admin', 'system'])
    async confirmWithdraw(@Body() confirmWithdrawDto: ConfirmWithdrawDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.confirmWithdrawRequest(confirmWithdrawDto, userId);
    }

    @Post('bankCertify')
    async bankCertify(@Body() reqBankCertifyDto: ReqBankCertifyDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.bankCertify(reqBankCertifyDto, userId);
    }

    @Get('bankInfo')
    @ApiDataResponse(typeEnum.object, QueryBankCardResponse)
    async queryBankInfo(@Query() queryBankCardInfo: QueryBankCardInfoDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.queryBankCardInfo(queryBankCardInfo, userId);
    }

    @Get('id')
    @ApiDataResponse(typeEnum.object, Withdraw)
    async findOne(@Param('id') id: string) {
        return await this.fundService.findOne(+id);
    }

    /* 订单列表 */
    @Get('list')
    @Public()
    @ApiPaginatedResponse(Withdraw)
    async list(@Query() listWithdrawDto: ListWithdrawDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.fundService.list(listWithdrawDto, paginationDto);
    }

    /* 我的订单列表 */
    @Get('myList')
    @ApiPaginatedResponse(Withdraw)
    async mylist(@Query() listMyWithdrawDto: ListMyWithdrawDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.fundService.mylist(userId, listMyWithdrawDto, paginationDto);
    }

    @Put(':id/cancel')
    async cancel(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.cancel(+id, userId);
    }

    @Put(':id/fail')
    async fail(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.fail(+id, userId);
    }

}
