import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { CreateAssetDto, UpdateAssetDto, ListAssetDto, FlowAssetDto } from './dto/request-asset.dto';
import { Asset } from './entities/asset.entity';
import { Collection } from './entities/collection.entity';

@Injectable()
export class AssetService {
  logger = new Logger(AssetService.name)
  constructor(
    @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
  ) { }
  create(createAssetDto: CreateAssetDto) {
    return this.assetRepository.create(createAssetDto);
  }

  /* 新增或编辑 */
  async addOrUpdate(createAssetDto: CreateAssetDto) {
    return await this.assetRepository.save(createAssetDto)
  }

  /* 分页查询 */
  async list(listAssetDto: ListAssetDto, paginationDto: PaginationDto): Promise<PaginatedDto<Asset>> {
    let where: FindOptionsWhere<Asset> = {}
    let result: any;
    const orderBy = paginationDto.isAsc === 'true' ? 'ASC' : 'DESC'
    where = {
      ...listAssetDto,
    };

    result = await this.assetRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      // select: ['assetId', "user", "collection"],
      relations: ["user", "collection"],
      where: listAssetDto,
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        price: paginationDto.orderByColumn === 'price' ? orderBy : undefined,
        updateTime: paginationDto.orderByColumn === 'updateTime' ? orderBy : undefined,
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* 分页查询 */
  async myList(userId: number, listAssetList: ListAssetDto, paginationDto: PaginationDto): Promise<PaginatedDto<Asset>> {
    let where: FindOptionsWhere<Asset> = {}
    let result: any;

    where = {
      ...listAssetList,
      userId: userId,
      collection: {
        name: paginationDto.keywords ? Like(`%${paginationDto.keywords}%`) : undefined
      }
    }
    const orderBy = paginationDto.isAsc === 'true' ? 'ASC' : 'DESC'
    result = await this.assetRepository.findAndCount({
      where,
      select: {
        id: true,
        assetNo: true,
        price: true,
        updateTime: true,
        createTime: true,
        userId: true,
        status: true,
        user: {
          nickName: true,
          avatar: true,
        },
        collection: {
          name: true,
          desc: true,
          supply: true,
          images: true,
          author: {
            nickName: true,
            avatar: true,
          },
        }
      },
      relations: {
        user: true,
        collection: true
      },
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        price: paginationDto.orderByColumn === 'price' ? orderBy : undefined,
        updateTime: paginationDto.orderByColumn === 'updateTime' ? orderBy : 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* 二级市场数据流查询 */
  async flow(flowAssetDto: FlowAssetDto, paginationDto: PaginationDto): Promise<PaginatedDto<Asset>> {
    let where: FindOptionsWhere<Asset> = {}
    let result: any;
    const orderBy = paginationDto.isAsc === 'true' ? 'ASC' : 'DESC'
    where = {
      ...flowAssetDto,
      status: '1',
      collection: {
        name: paginationDto.keywords ? Like(`%${paginationDto.keywords}%`) : undefined
      }
    }

    result = await this.assetRepository.findAndCount({
      select: {
        id: true,
        assetNo: true,
        price: true,
        updateTime: true,
        createTime: true,
        userId: true,
        status: true,
        user: {
          nickName: true,
          avatar: true,
        },
        collection: {
          name: true,
          desc: true,
          supply: true,
          images: true,
          // contract: true,
        }
      },
      where,
      relations: {
        user: true,
        collection: true
      },
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        price: paginationDto.orderByColumn === 'price' ? orderBy : undefined,
        updateTime: paginationDto.orderByColumn === 'updateTime' ? orderBy : undefined,
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  async latest(): Promise<PaginatedDto<Asset>> {
    let where: FindOptionsWhere<Asset> = {
      status: '1' // market
    }
    let result: any;

    result = await this.assetRepository.findAndCount({
      select: {
        id: true,
        assetNo: true,
        price: true,
        updateTime: true,
        userId: true,
        status: true,
        user: {
          nickName: true,
          avatar: true,
        },
        collection: {
          name: true,
          desc: true,
          supply: true,
          images: true,
          // contract: true,
        }
      },
      relations: {
        user: true,
        collection: true
      },
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
    return this.assetRepository.findOne({
      select: {
        id: true,
        assetNo: true,
        price: true,
        userId: true,
        status: true,
        user: {
          nickName: true,
          avatar: true,
        },
        collection: {
          author: {
            nickName: true,
            avatar: true,
          },
          name: true,
          desc: true,
          supply: true,
          current: true,
          images: true,
          status: true,
          contract: {
            chain: true,
            standard: true,
            address: true,
            markno: true,
          },
        }
      },
      where: { id },
      relations: {
        user: true,
        collection: {
          author: true,
          contract: true,

        }
      }
    })
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
  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }
}
