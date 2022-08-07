import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiException } from 'src/common/exceptions/api.exception';
import { FindConditions, Like, Repository } from 'typeorm';
import { CreateAssetDto, UpdateAssetDto, ListAssetDto, FlowAssetDto } from './dto/request-asset.dto';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetService {
  constructor(
    @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
  ) { }
  create(createAssetDto: CreateAssetDto) {
    return this.assetRepository.save(createAssetDto);
  }

  /* 新增或编辑 */
  async addOrUpdate(createAssetDto: CreateAssetDto) {
    return await this.assetRepository.save(createAssetDto)
  }

  /* 分页查询 */
  async list(listAssetList: ListAssetDto, paginationDto: PaginationDto): Promise<PaginatedDto<Asset>> {
    let where: FindConditions<Asset> = {}
    let result: any;

    where = listAssetList;

    result = await this.assetRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      // select: ['assetId', "user", "collection"],
      relations: ["user", "collection"],
      where,
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 1,
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* 二级市场数据流查询 */
  async flow(flowAssetDto: FlowAssetDto, paginationDto: PaginationDto): Promise<PaginatedDto<Asset>> {
    let where: FindConditions<FlowAssetDto> = {}
    let result: any;
    where = flowAssetDto;
    result = await this.assetRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      // select: ['assetId', "user", "collection"],
      relations: ["user", "collection"],
      where,
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 1,
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  async latest(): Promise<PaginatedDto<Asset>> {
    let where: FindConditions<Asset> = {
      status: '1' // market
    }
    let result: any;

    result = await this.assetRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      // select: ['assetId', "user", "collection"],
      relations: ["user", "collection"],
      where,
      skip: 0,
      take: 6,
      order: {
        updateTime: 'DESC',
      },
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.assetRepository.findOne(id)
  }

  update(id: number, updateAssetDto: UpdateAssetDto) {
    return `This action updates a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }
  async delete(idArr: number[] | string[]) {
    return this.assetRepository.delete(idArr)
  }
}
