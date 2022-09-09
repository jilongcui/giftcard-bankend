import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User as UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ConfirmWithdrawDto, CreateWithdrawDto, QueryBankCardInfoDto, ReqBankCertifyDto, ReqWithdrawDto, WithdrawWithCardDto } from './dto/request-fund.dto';
import { FundService } from './fund.service';
import { QueryBankCardResponse } from './dto/response-fund.dto';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';

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
}
