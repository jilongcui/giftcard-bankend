import { Query, Controller, Get, Inject, Post, Body, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { CollectService } from './collect.service';
import { ReqCollectRechargeNotifyDto, ListRechargeCollectDto } from './dto/req-rechargecollect-list.dto';
import { RechargeCollect } from './entities/rechage-collect.entity';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { Keep } from '@app/common/decorators/keep.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ExcelService } from '@app/modules/common/excel/excel.service';

@ApiTags("钱包归集")
@ApiBearerAuth()
@Controller('wallet/collect')
export class CollectController {
    constructor(private readonly collectService: CollectService,
        private readonly excelService: ExcelService) { }

    @Get('list')
    @Public()
    @ApiPaginatedResponse(RechargeCollect)
    async list(@Query() listRechargeCollectDto: ListRechargeCollectDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return this.collectService.list(listRechargeCollectDto, paginationDto);
    }

    /* 导出列表 */
    @RepeatSubmit()
    @Post('export')
    @RequiresPermissions('monitor:collect:export')
    @Keep()
    async export(@Query() listRechargeCollectDto: ListRechargeCollectDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        const { rows } = await this.collectService.list(listRechargeCollectDto, paginationDto);
        const file = await this.excelService.export(RechargeCollect, rows)
        return new StreamableFile(file)
    }

    @Get('mylist')
    @ApiPaginatedResponse(RechargeCollect)
    async mylist(@Query() listRechargeCollectDto: ListRechargeCollectDto, @Query(PaginationPipe) paginationDto: PaginationDto, @UserDec(UserEnum.userId) userId: number) {
        return this.collectService.mylist(userId, listRechargeCollectDto, paginationDto);
    }

    @Post('notify')
    @Public() 
    async rechargeNotify(@Body() rechargeNotifyDto: ReqCollectRechargeNotifyDto) {
        return this.collectService.collectionRechargeNotify(rechargeNotifyDto)
    }
}
