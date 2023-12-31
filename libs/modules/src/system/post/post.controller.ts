/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, Query, StreamableFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ApiException } from '@app/common/exceptions/api.exception';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { ReqAddPostDto, ReqPostListDto } from './dto/req-post.dto';
import { PostService } from './post.service';
import { Post as SysPost } from './entities/post.entity';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { DataObj } from '@app/common/class/data-obj.class';
import { Keep } from '@app/common/decorators/keep.decorator';
import { ExcelService } from '@app/modules/common/excel/excel.service';
import { BusinessTypeEnum, Log } from '@app/common/decorators/log.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';

@ApiTags('岗位管理')
@Controller('system/post')
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly excelService: ExcelService
    ) { }

    /* 新增岗位 */
    @RepeatSubmit()
    @Post()
    @RequiresPermissions('system:post:add')
    @Log({
        title: '岗位管理',
        businessType: BusinessTypeEnum.insert
    })
    async add(@Body() reqAddPostDto: ReqAddPostDto, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        const post = await this.postService.findByPostCode(reqAddPostDto.postCode)
        if (post) throw new ApiException('岗位编码已存在，请更换')
        reqAddPostDto.createBy = reqAddPostDto.updateBy = userName
        await this.postService.addOrUpdate(reqAddPostDto)
    }

    /* 分页查询岗位列表 */
    @Get('list')
    @RequiresPermissions('system:post:query')
    @ApiPaginatedResponse(SysPost)
    async list(@Query(PaginationPipe) reqPostListDto: ReqPostListDto) {
        return this.postService.list(reqPostListDto)
    }

    /* 通过id查询岗位 */
    @Get(':postId')
    @RequiresPermissions('system:post:query')
    @ApiDataResponse(typeEnum.object, SysPost)
    async one(@Param('postId') postId: number) {
        const post = await this.postService.findById(postId)
        return post
    }

    /* 修改岗位 */
    @RepeatSubmit()
    @Put()
    @RequiresPermissions('system:post:edit')
    @Log({
        title: '岗位管理',
        businessType: BusinessTypeEnum.update
    })
    async update(@Body() post: SysPost, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        post.updateBy = userName
        await this.postService.addOrUpdate(post)
    }

    /* 删除岗位 */
    @Delete(":postIds")
    @RequiresPermissions('system:post:remove')
    @Log({
        title: '岗位管理',
        businessType: BusinessTypeEnum.delete
    })
    async delete(@Param('postIds') postIds: string) {
        await this.postService.delete(postIds.split(','))
    }

    /* 导出岗位 */
    @RepeatSubmit()
    @Post('export')
    @RequiresPermissions('system:post:export')
    @Keep()
    @Log({
        title: '岗位管理',
        businessType: BusinessTypeEnum.export,
        isSaveResponseData: false
    })
    async export(@Body(PaginationPipe) reqPostListDto: ReqPostListDto) {
        const { rows } = await this.postService.list(reqPostListDto)
        const file = await this.excelService.export(SysPost, rows)
        return new StreamableFile(file)
    }

}
