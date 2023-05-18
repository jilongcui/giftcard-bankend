import { Injectable } from '@nestjs/common';
import { CreateVersionDto, ListVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, In } from 'typeorm';
import { Version } from './entities/version.entity';
import { PaginationDto } from '@app/common/dto/pagination.dto';

@Injectable()
export class VersionService {
  constructor(
    @InjectRepository(Version) private readonly versionRepository: Repository<Version>
  ) { }

  /* 通过版本Code */
  async findByVersionCode(versionCode: number) {
      return await this.versionRepository.findOneBy({ versionCode })
  }

  /* 新增或编辑 */
  async create(createVersionDto: CreateVersionDto) {
      await this.versionRepository.save(createVersionDto)
  }

  update(id: number, updateOrderDto: UpdateVersionDto) {
    return this.versionRepository.update(id, updateOrderDto)
  }

  findOne(id: number) {
    return this.versionRepository.findOne({ where: { id }, relations: { } })
  }

  /* 分页查询 */
  async list(reqVersionListDto: ListVersionDto, paginationDto: PaginationDto): Promise<PaginatedDto<Version>> {
      let where: FindOptionsWhere<Version> = {}
      if (reqVersionListDto.versionCode) {
          where.versionCode = reqVersionListDto.versionCode
      }
      if (reqVersionListDto.versionName) {
          where.versionName = Like(`%${reqVersionListDto.versionName}%`)
      }
      if (reqVersionListDto.status) {
          where.status = reqVersionListDto.status
      }
      const result = await this.versionRepository.findAndCount({
          // select: ['id', 'versionCode', 'versionName', 'status', 'createBy', 'remark'],
          where,
          order: {
              createTime: 'DESC'
          },
          skip: paginationDto.skip,
          take: paginationDto.take
      })
      return {
          rows: result[0],
          total: result[1]
      }
  }

  /* 通过id查找 */
  async findById(versionId: number) {
      return await this.versionRepository.findOneBy({ id: versionId })
  }

  /* 通过id数组删除 */
  async delete(versionIdArr: number[] | string[]) {
      return await this.versionRepository.delete(versionIdArr)
  }

  /* 通过 id 数组查询所有符合的数据 */
  async listByIdArr(idArr: number[]) {
      return this.versionRepository.find({
          where: {
              id: In(idArr)
          }
      })
  }
}
