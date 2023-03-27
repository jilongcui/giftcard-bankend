/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, Query, Sse, MessageEvent, Logger, UseGuards, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { BusinessTypeEnum, Log } from '@app/common/decorators/log.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { Dialog } from './entities/dialog.entity';
import { DialogService } from './dialog.service';
import { CreateDialogDto, OpenDialogDto, CloseDialogDto, PromptDto } from './dto/create-dialog.dto';
import {Observable, map, interval, from, catchError, of} from 'rxjs';
import { Keep } from '@app/common/decorators/keep.decorator';
import { MemberAuthGuard } from '@app/common/guards/member-auth.guard';
import { AllWsExceptionsFilter } from '@app/common/filters/all-ws-exception.filter';
import { AllExceptionsFilter } from '@app/common/filters/all-exception.filter';
import { ApiException } from '@app/common/exceptions/api.exception';

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
    // async add(@Body() reqAddDialogDto: ReqAddDialogDto, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
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
        // this.logger.debug(JSON.stringify(createDialogDto))
        const result = await this.dialogService.open(createDialogDto)
        return result
    }

    @Sse('promptSse')
    @Keep()
    promptSse(@Body() promptDto: PromptDto, @UserDec(UserEnum.userId) userId: number,
        @UserDec(UserEnum.openId, UserInfoPipe) openId: string
    ): Observable<MessageEvent> {
        return from(this.dialogService.promptSse(promptDto, userId, openId)).pipe(
            map(data => ({event: 'promptSse', data: data})),
            catchError(error => { throw new ApiException('Bad Request' + error.getError())})
        )
    }

    @Sse('prompt')
    @Keep()
    @Public()
    prompt(): Observable<MessageEvent> {
        // const result = await this.dialogService.promptSse(promptDto, userId);
        // return result
        this.logger.debug('111')
        const myBadPromise = () =>
  new       Promise((resolve, reject) => reject('Rejected!'));
        // return from(myBadPromise()).pipe(
        //     catchError(error => of( {data: `Bad Promise: ${error}`} )),
        //     map((_) => ({ data: 'hello' })))

            return from(myBadPromise()).pipe(
                map((_) => ({ data: 'hello' })),
                catchError(error => { throw new ApiException('Bad Request')})
        )
        // return interval(1000).pipe(map((_) => ({ data: 'hello' })));
    }

    @Post('close')
    close(@Body() closeDialogDto: CloseDialogDto, @UserDec(UserEnum.userId) userId: number) {
        return this.dialogService.close(closeDialogDto.dialogId, userId);
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
