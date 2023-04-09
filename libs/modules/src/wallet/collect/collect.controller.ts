import { Query, Controller, Get, Inject, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { CollectService } from './collect.service';
import { ReqCollectRechargeNotifyDto, ReqRechargeCollectListDto } from './dto/req-rechargecollect-list.dto';
import { RechargeCollect } from './entities/rechage-collect.entity';

@ApiTags("钱包归集")
@ApiBearerAuth()
@Controller('wallet/collect')
export class CollectController {
    constructor(private readonly collectService: CollectService) { }

    @Get()
    @Public()
    @ApiPaginatedResponse(RechargeCollect)
    async list(@Query() reqRechargeCollectListDto: ReqRechargeCollectListDto) {
        return this.collectService.list(reqRechargeCollectListDto);
    }

    @Post('notify')
    @Public() 
    async rechargeNotify(@Body() rechargeNotifyDto: ReqCollectRechargeNotifyDto) {
        return this.collectService.collectionRechargeNotify(rechargeNotifyDto)
    }
}
