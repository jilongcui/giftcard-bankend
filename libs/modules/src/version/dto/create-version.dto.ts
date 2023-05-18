import { OmitType, PartialType } from "@nestjs/swagger"
import { Version } from "../entities/version.entity"


/* 新增岗位 */
export class CreateVersionDto extends OmitType(Version, ['id'] as const) { }

/* 分页查询 */
export class ListVersionDto extends PartialType(OmitType(Version, [] as const)) {
}