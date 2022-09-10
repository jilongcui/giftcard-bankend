import { ApiDataResponse } from '@app/common/decorators/api-data-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { UserInviteStatsDto } from './dto/request-stats.dto';
import { StatsService } from './stats.service';

@ApiTags('统计')
@SkipThrottle()
@Controller('stats')
export class StatsController {
    constructor(
        private readonly statsService: StatsService
    ) { }
    @Get('userInviteInfo')
    @Public()
    // @ApiDataResponse()
    async userInviteInfo(@Query() userInviteStatsDto: UserInviteStatsDto) {
        return await this.statsService.getUserInviteInfo(userInviteStatsDto);
    }
}
