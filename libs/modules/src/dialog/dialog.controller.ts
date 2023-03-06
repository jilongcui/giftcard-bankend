/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, Query, Sse, MessageEvent, Logger, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { BusinessTypeEnum, Log } from '@app/common/decorators/log.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { User, UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { Dialog } from './entities/dialog.entity';
import { DialogService } from './dialog.service';
import { CreateDialogDto, OpenDialogDto, PromptDto } from './dto/create-dialog.dto';
import {Observable, map, interval} from 'rxjs';
import { Keep } from '@app/common/decorators/keep.decorator';
import { MemberAuthGuard } from '@app/common/guards/member-auth.guard';

@ApiTags('对话接口')
@Controller('dialog')
export class DialogController {
    logger  = new Logger(DialogController.name)
    constructor(
        private readonly dialogService: DialogService
    ) { }
    /* 新增公告 */
    // @Post()
    // @Log({
    //     title: '通知公告',
    //     businessType: BusinessTypeEnum.insert
    // })
    // async add(@Body() reqAddDialogDto: ReqAddDialogDto, @User(UserEnum.userName, UserInfoPipe) userName: string) {
    //     reqAddDialogDto.createBy = reqAddDialogDto.updateBy = userName
    //     await this.dialogService.addOrUpdate(reqAddDialogDto)
    // }

    @UseGuards(MemberAuthGuard)
    @Post('openDialog')
    async open(@Body() openDialogDto: OpenDialogDto, @UserDec(UserEnum.userId) userId: number, @UserDec(UserEnum.nickName, UserInfoPipe) nickName: string) {
        const createDialogDto: CreateDialogDto = {
        userId: userId,
        userName: nickName,
        appmodelId: openDialogDto.appmodelId,
        }
        const result = await this.dialogService.open(createDialogDto)
        return result
    }

    @Sse('promptSse')
    @Keep()
    promptSse(@Body() promptDto: PromptDto, @UserDec(UserEnum.userId) userId: number): Observable<MessageEvent> {
        // const result = await this.dialogService.promptSse(promptDto, userId);
        // return result
        return interval(1000).pipe(map((_) => ({ data: 'hello' })));
    }

    @Sse('prompt')
    @Keep()
    @Public()
    prompt(): Observable<MessageEvent> {
        // const result = await this.dialogService.promptSse(promptDto, userId);
        // return result
        this.logger.debug('111')
        return interval(1000).pipe(map((_) => ({ data: 'hello' })));
    }

    @Post('close')
    close(@Body() id: number, @UserDec(UserEnum.userId) userId: number) {
        this.dialogService.close(id, userId);
        return {}
    }

    // /* 分页查询公告 */
    // @Get("list")
    // @Public()
    // @ApiPaginatedResponse(Dialog)
    // async list(@Query(PaginationPipe) reqNoeiceList: ReqNoeiceList) {
    //     return this.dialogService.list(reqNoeiceList)
    // }

    // /* 通过id查询公告 */
    // @Get(':dialogId')
    // @Public()
    // @ApiDataResponse(typeEnum.object, Dialog)
    // async one(@Param('dialogId') dialogId: string) {
    //     const dialog = await this.dialogService.findById(+dialogId)
    //     return dialog
    // }

    /* 我的订单列表 */


    // /* 删除公告 */
    // @Delete(':dialogIds')
    // @RequiresPermissions('system:dialog:remove')
    // @Log({
    //     title: '通知公告',
    //     businessType: BusinessTypeEnum.delete
    // })
    // async delete(@Param('dialogIds') dialogIds: string) {
    //     await this.dialogService.delete(dialogIds.split(','))
    // }
}
