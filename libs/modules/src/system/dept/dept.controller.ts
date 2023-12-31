/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { BusinessTypeEnum, Log } from '@app/common/decorators/log.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { TreeDataDto } from '@app/common/dto/tree-data.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { DeptService } from './dept.service';
import { ReqAddDeptDto, ReqDeptListDto, ReqUpdateDept } from './dto/req-dept.dto';
import { ResRoleDeptTreeselectDto } from './dto/res-dept.dto';

@ApiTags('部门管理')
@Controller("system/dept")
export class DeptController {
    constructor(
        private readonly deptService: DeptService
    ) { }

    /* 新增部门 */
    @RepeatSubmit()
    @Post()
    @RequiresPermissions('system:dept:add')
    @Log({
        title: '部门管理',
        businessType: BusinessTypeEnum.insert
    })
    async add(@Body() ReqAddDeptDto: ReqAddDeptDto, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        ReqAddDeptDto.createBy = ReqAddDeptDto.updateBy = userName
        await this.deptService.addOrUpdate(ReqAddDeptDto)
    }

    /* 部门列表 */
    @Get('list')
    @RequiresPermissions('system:dept:query')
    @ApiDataResponse(typeEnum.objectArr, ReqAddDeptDto)
    async list(@Query() reqDeptListDto: ReqDeptListDto) {
        const deptArr = await this.deptService.list(reqDeptListDto)
        return deptArr
    }

    /* 获取部门树结构 */
    @Get('treeselect')
    @ApiDataResponse(typeEnum.objectArr, TreeDataDto)
    async treeselect() {
        const deptTree = await this.deptService.treeselect()
        return deptTree
    }

    /* 通过id查询部门 */
    @Get(':deptId')
    @RequiresPermissions('system:dept:query')
    @ApiDataResponse(typeEnum.object, ReqAddDeptDto)
    async one(@Param('deptId') deptId: number) {
        const dept = await this.deptService.findRawById(deptId)
        return dept
    }

    /* 查询除自己(包括子类)外部门列表 */
    @Get('list/exclude/:deptId')
    @ApiDataResponse(typeEnum.objectArr, ReqAddDeptDto)
    async outList(@Param('deptId') deptId: number) {
        const deptArr = await this.deptService.outList(deptId)
        return deptArr
    }

    /* 修改部门 */
    @RepeatSubmit()
    @Put()
    @RequiresPermissions('system:dept:edit')
    @Log({
        title: '部门管理',
        businessType: BusinessTypeEnum.update
    })
    async update(@Body() reqUpdateDept: ReqUpdateDept, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        reqUpdateDept.updateBy = userName
        await this.deptService.addOrUpdate(reqUpdateDept)
    }

    /* 删除部门 */
    @Delete(':deptId')
    @RequiresPermissions('system:dept:remove')
    @Log({
        title: '部门管理',
        businessType: BusinessTypeEnum.delete
    })
    async delete(@Param('deptId') deptId: string, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        const childs = await this.deptService.findChildsByParentId(deptId)
        if (childs && childs.length) throw new ApiException('该部门下还存在其他部门，无法删除')
        await this.deptService.delete(deptId, userName)
    }

    /* 通过角色Id查询该角色的数据权限 */
    @Get('roleDeptTreeselect/:roleId')
    @ApiDataResponse(typeEnum.object, ResRoleDeptTreeselectDto)
    async roleDeptTreeselect(@Param('roleId') roleId: number): Promise<ResRoleDeptTreeselectDto> {
        const depts = await this.deptService.treeselect()
        const checkedKeys = await this.deptService.getCheckedKeys(roleId)
        return {
            depts,
            checkedKeys
        }
    }


}
