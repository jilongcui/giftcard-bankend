/* res的数据说明
* | 参数名称      | 一定返回  | 类型     | 描述
* | -------------|--------- | --------- | ------------- |
* | versionCode  | y     | int     | 版本号        |
* | versionName  | y     | String | 版本名称      |
* | versionInfo  | y     | String | 版本信息      |
* | updateType      | y     | String | forcibly = 强制更新, solicit = 弹窗确认更新, silent = 静默更新 |
* | downloadUrl  | y     | String | 版本下载链接（IOS安装包更新请放跳转store应用商店链接,安卓apk和wgt文件放文件下载链接）  |
*/

import { Excel } from "@app/modules/common/excel/excel.decorator"
import { ApiHideProperty } from "@nestjs/swagger"
import { IsBoolean, IsEnum, IsNumber, IsString } from "class-validator"
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm"

export enum VersionTypeEnum {
    "forcibly" = "forcibly",
    "solicit" = "solicit",
    "silent" = "silent"
}

@Entity()
export class Version {

    @PrimaryGeneratedColumn({
        name: 'id',
        comment: 'id',
    })
    @IsNumber()
    id: number

    @Column({
        name: 'version_code',
        comment: '版本代码',
    })
    @IsNumber()
    versionCode: number

    @Column({
        name: 'version_name',
        comment: '版本名称',
        length: 50
    })
    @IsString()
    versionName: string

    @Column({
        name: 'version_info',
        comment: '版本信息',
        length: 250
    })
    @IsString()
    versionInfo: string

    /* 岗位名称 */
    @Column({
        name: 'update_type',
        type: 'enum',
        enum: VersionTypeEnum,
        comment: '更新类型',
    })
    @IsEnum(VersionTypeEnum)
    updateType: VersionTypeEnum

    @Column({
        name: 'ios_url',
        comment: 'ios端下载',
        length: 150
    })
    @IsString()
    iosUrl: string

    @Column({
        name: 'android_url',
        comment: 'android现在',
        length: 150
    })
    @IsString()
    androidUrl: string

    /* 状态 0: 无效 1: 有效 */
    @Column({
        name: 'status',
        default: '0',
        length: 1,
        comment: '状态 0: 无效 1: 有效',
    })
    @IsString()
    status: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    @Excel({
        name: '创建时间',
    })
    createTime: Date
}
