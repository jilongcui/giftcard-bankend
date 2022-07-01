import { Query, Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { CollectService } from './collect.service';
import { ReqRechargeCollectListDto } from './dto/req-rechargecollect-list.dto';

@ApiTags("钱包归集")
@Controller('wallet/collect')
export class CollectController {
    constructor(private readonly collectService: CollectService) { }

    @Get()
    @Public()
    async list(@Query() reqRechargeCollectListDto: ReqRechargeCollectListDto) {
        this.collectService.list(reqRechargeCollectListDto);
    }
}
