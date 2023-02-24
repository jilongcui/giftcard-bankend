/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, Query, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';
import { BusinessTypeEnum, Log } from '@app/common/decorators/log.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { User, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { ExcelService } from '@app/modules/common/excel/excel.service';
import { ReqAddConfigDto, ReqConfigListDto } from './dto/req-sys-config.dto';
import { SysConfig } from './entities/sys-config.entity';
import { SysConfigService } from './sys-config.service';
import { Public } from '@app/common/decorators/public.decorator';

@ApiTags('通用参数设置')
@Controller('config')
export class ConfigController {
    constructor(
        private readonly sysConfigService: SysConfigService,
        private readonly excelService: ExcelService
    ) { }

    /* 通过 configKey 查询参数(缓存查询) */
    @Get('/configKey/:configKey')
    @Public()
    @ApiDataResponse(typeEnum.string, SysConfig)
    async getNormalconfigKey(@Param('configKey') configKey: string) {
        const sysConfig = await this.sysConfigService.getNormalValueByConfigKey(configKey)
        return sysConfig
    }

    /* 通过id查询参数 */
    @Get(":configId")
    @Public()
    @RequiresPermissions('system:config:query')
    @ApiDataResponse(typeEnum.object, SysConfig)
    async one(@Param('configId') configId: number) {
        const sysConfig = await this.sysConfigService.findNormalById(configId)
        return sysConfig
    }

    
}
