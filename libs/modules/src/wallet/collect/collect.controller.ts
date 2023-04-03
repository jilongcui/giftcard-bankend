import { Query, Controller, Get, Inject, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { CollectService } from './collect.service';
import { ReqCollectRechageNotifyDto, ReqRechargeCollectListDto } from './dto/req-rechargecollect-list.dto';
import { RechargeCollect } from './entities/rechage-collect.entity';

@ApiTags("钱包归集")
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
    async rechargeNotify(@Body() rechargeNotifyDto: ReqCollectRechageNotifyDto) {
        this.collectService.collectionRechargeNotify(rechargeNotifyDto)
    }
}
