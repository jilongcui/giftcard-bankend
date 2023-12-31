/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-09 10:11:33
 * @LastEditTime: 2022-01-05 20:01:11
 * @LastEditors: Sheng.Jiang
 * @Description: 分页请求参数
 * @FilePath: \meimei\src\common\dto\pagination.dto.ts
 * You can you up，no can no bb！！
 */
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsBoolean, IsBooleanString, IsNumber, IsOptional, IsString } from "class-validator"

export class PaginationDto {

    /* 当前页 */
    @IsOptional()
    @Type()
    @IsNumber()
    public pageNum?: number

    /* 当前ID */
    @IsOptional()
    @Type()
    @IsNumber()
    public lastId?: number

    /* 每页条数 */
    @IsOptional()
    @Type()
    @IsNumber()
    public pageSize?: number

    /* 排序字段 */
    @IsOptional()
    @Type()
    @IsString()
    public orderByColumn?: string

    /* 排序方式 */
    @IsOptional()
    @IsString()
    public isAsc?: string

    /* 搜索关键字 */
    @IsOptional()
    @IsString()
    public keywords?: string

    /* mysql忽略条数 */
    @ApiHideProperty()
    public skip: number
    /* mysql返回条数 */
    @ApiHideProperty()
    public take: number

    /* 开始日期 */
    @IsString()
    @IsOptional()
    @ApiProperty({
        name: 'beginTime',
        // default: moment().format("YYYY-MM-DD")
    })
    beginTime?: Date

    /* 结束日期 */
    @IsString()
    @IsOptional()
    @ApiProperty({
        name: 'endTime',
        // default: moment().format("YYYY-MM-DD")
    })
    endTime?: Date
}