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
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { ExcelService } from '@app/modules/common/excel/excel.service';
import { ReqAddConfigDto, ReqConfigListDto } from './dto/req-sys-config.dto';
import { SysConfig } from './entities/sys-config.entity';
import { SysConfigService } from './sys-config.service';

@ApiTags('参数设置')
@Controller('system/config')
export class SysConfigController {
    constructor(
        private readonly sysConfigService: SysConfigService,
        private readonly excelService: ExcelService
    ) { }

    /* 新增参数 */
    @RepeatSubmit()
    @Post()
    @Log({
        title: '参数设置',
        businessType: BusinessTypeEnum.insert
    })
    @RequiresPermissions('system:config:add')
    async add(@Body() reqAddConfigDto: ReqAddConfigDto, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        reqAddConfigDto.createBy = reqAddConfigDto.updateBy = userName
        await this.sysConfigService.addOrUpdate(reqAddConfigDto)
    }

    /* 分页查询参数列表 */
    @Get('list')
    @RequiresPermissions('system:config:query')
    @ApiPaginatedResponse(SysConfig)
    async list(@Query(PaginationPipe) reqConfigListDto: ReqConfigListDto) {
        return await this.sysConfigService.list(reqConfigListDto)
    }

    /* 清除缓存 */
    @Delete('refreshCache')
    @Log({
        title: '参数设置',
        businessType: BusinessTypeEnum.clean
    })
    async refreshCache() {
        await this.sysConfigService.refreshCache()
    }

    /* 通过 configKey 查询参数(缓存查询) */
    @Get('/configKey/:configKey')
    @ApiDataResponse(typeEnum.string, SysConfig)
    async oneByconfigKey(@Param('configKey') configKey: string) {
        const sysConfig = await this.sysConfigService.lazyFindByConfigKey(configKey)
        return sysConfig
    }

    /* 通过id查询参数 */
    @Get(":configId")
    @RequiresPermissions('system:config:query')
    @ApiDataResponse(typeEnum.object, SysConfig)
    async one(@Param('configId') configId: number) {
        const sysConfig = await this.sysConfigService.findById(configId)
        return sysConfig
    }

    /* 修改参数 */
    @RepeatSubmit()
    @Put()
    @Log({
        title: '参数设置',
        businessType: BusinessTypeEnum.update
    })
    @RequiresPermissions('system:config:edit')
    async updata(@Body() sysConfig: SysConfig, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        sysConfig.updateBy = userName
        await this.sysConfigService.addOrUpdate(sysConfig)
    }

    /* 删除参数 */
    @Delete(":configIds")
    @Log({
        title: '参数设置',
        businessType: BusinessTypeEnum.delete
    })
    @RequiresPermissions('system:config:remove')
    async delete(@Param('configIds') configIds: String) {
        await this.sysConfigService.delete(configIds.split(','))
    }

    /* 导出 */
    @RepeatSubmit()
    @Post("export")
    @RequiresPermissions('system:config:export')
    @Log({
        title: '参数设置',
        businessType: BusinessTypeEnum.export
    })
    @Keep()
    async export(@Body(PaginationPipe) reqConfigListDto: ReqConfigListDto) {
        const { rows } = await this.sysConfigService.list(reqConfigListDto)
        const file = await this.excelService.export(SysConfig, rows)
        return new StreamableFile(file)
    }
}
