import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { CacheInterceptor, CacheKey, CacheTTL, Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { UserInviteStatsDto } from './dto/request-stats.dto';
import { ResInviteUserDto } from './dto/response-stats.dto';
import { StatsService } from './stats.service';

@ApiTags('统计')
@SkipThrottle()
@UseInterceptors(CacheInterceptor)
@Controller('stats')
export class StatsController {
    constructor(
        private readonly statsService: StatsService
    ) { }
    @Get('userInviteInfo')
    @Public()
    @CacheTTL(300)
    @ApiDataResponse(typeEnum.objectArr, ResInviteUserDto)
    async userInviteInfo(@Query() userInviteStatsDto: UserInviteStatsDto) {
        return await this.statsService.getUserInviteInfo(userInviteStatsDto);
    }
}
