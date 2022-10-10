import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, In, IsNull, Like, Not, Repository } from 'typeorm';
import { CreateCollectionDto, UpdateCollectionDto, ListCollectionDto, ListMyCollectionDto } from './dto/request-collection.dto';
import { Collection } from './entities/collection.entity';
import { CreateAssetDto } from './dto/request-asset.dto';
import { User } from '../system/user/entities/user.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { Asset } from './entities/asset.entity';
import { MintADto } from '@app/chain/dto/request-chain.dto';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CollectionService {
  platformAddress: string
  logger = new Logger(CollectionService.name)
  constructor(
    @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
    private readonly configService: ConfigService,
    @Inject('CHAIN_SERVICE') private client: ClientProxy,
  ) {
    this.platformAddress = this.configService.get<string>('crichain.platformAddress')
  }
  create(createCollectionDto: CreateCollectionDto) {
    return this.collectionRepository.save(createCollectionDto);
  }

  /* 新增或编辑 */
  async addOrUpdate(updateCollectionDto: UpdateCollectionDto) {
    return await this.collectionRepository.save(updateCollectionDto)
  }

  /* 分页查询 */
  async list(listProdList: ListCollectionDto, paginationDto: PaginationDto): Promise<PaginatedDto<Collection>> {
    let where: FindOptionsWhere<Collection> = {}
    let result: any;
    if (listProdList.name) {
      where.name = Like(`%${listProdList.name}%`)
    }
    if (listProdList.id) {
      where.id = listProdList.id
    }
    result = await this.collectionRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: ['contract', 'author'],
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

  /* 分页查询 */
  async newlist(listProdList: ListCollectionDto, paginationDto: PaginationDto): Promise<PaginatedDto<Collection>> {
    let where: FindOptionsWhere<Collection> = {}
    let result: any;
    if (listProdList.type) {
      where.type = listProdList.type
    }
    where.activityId = IsNull()
    result = await this.collectionRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      relations: ['contract', 'author'],
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

  /* 我的藏品查询 */
  async mylist(userId: number, listMyCollectionDto: ListMyCollectionDto, paginationDto: PaginationDto): Promise<PaginatedDto<Collection>> {
    let where: FindOptionsWhere<Asset> = {}
    let result: any;
    where = {
      ...listMyCollectionDto,
      userId: userId,
    }
    // if (listMyCollectionDto.status === '1')
    //   where.invalidTime = MoreThanOrEqual(moment(moment.now()).toDate())

    const myQueryBuilder = await this.assetRepository.createQueryBuilder('asset')
      .select('count(*)', 'mycount')
      .addSelect('collection.id', 'id')
      .addSelect('collection.name', 'name')
      .addSelect('collection.supply', 'supply')
      .addSelect('collection.current', 'current')
      .addSelect('collection.status', 'status')
      .addSelect('collection.images', 'images')
      .leftJoin('asset.collection', 'collection')
      .where(where)
      .orderBy('collection.create_time', 'DESC')
      .groupBy('asset.collection_id')
    // .limit(params.count)
    // this.logger.debug(myQueryBuilder.getQuery())

    let resultArr = await myQueryBuilder.getRawMany()
    resultArr = resultArr.filter(l => l != undefined)
    return {
      rows: resultArr,
      total: resultArr.length
    }
  }

  /* collection下的asset分页查询*/
  async assetList(collectionId: number, paginationDto: PaginationDto): Promise<PaginatedDto<Asset>> {
    let where: FindOptionsWhere<Asset> = {}
    let result: any;

    where.collectionId = collectionId
    result = await this.assetRepository.findAndCount({
      select: {
        id: true,
        assetNo: true,
        price: true,
        status: true,
        userId: true,
        createTime: true
      },
      where,
      skip: paginationDto.skip,
      take: paginationDto.take || 20,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  /* collection下的asset分页查询 */
  async myAssetList(collectionId: number, userId: number, paginationDto: PaginationDto): Promise<PaginatedDto<Asset>> {
    let where: FindOptionsWhere<Asset> = {}
    let result: any;

    where.collectionId = collectionId
    where.userId = userId
    result = await this.assetRepository.findAndCount({
      select: {
        id: true,
        assetNo: true,
        price: true,
        status: true,
        userId: true,
        createTime: true,
      },
      where,
      skip: paginationDto.skip,
      take: paginationDto.take || 20,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.collectionRepository.findOne({ where: { id: id }, relations: ['author', 'contract'], })
  }

  async hasOne(id: number, userId: number) {
    const asset = await this.assetRepository.findOne({ where: { collectionId: id, userId: userId } })
    return asset
  }

  findByIds(ids: string) {
    return this.collectionRepository.findBy({ id: In(ids.split(',')) })
  }

  update(id: number, updateCollectionDto: UpdateCollectionDto) {
    return `This action updates a #${id} collection`;
  }

  remove(id: number) {
    return `This action removes a #${id} collection`;
  }
  async delete(noticeIdArr: number[] | string[]) {
    return this.collectionRepository.delete(noticeIdArr)
  }

  async openMarket(id: number) {
    const updateCollectionDto = new UpdateCollectionDto()
    updateCollectionDto.status = '1' // Set top
    return this.collectionRepository.update(id, updateCollectionDto)
  }

  async closeMarket(id: number) {
    const updateCollectionDto = new UpdateCollectionDto()
    updateCollectionDto.status = '0' // Set untop
    return this.collectionRepository.update(id, updateCollectionDto)
  }

  async sendChainTransaction(collectionIds: string[], user: User, count: number, price: number) {
    // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
    const collections = await this.collectionRepository.findBy({ id: In(collectionIds) })
    for (let i = 0; i < count; i++) {
      const index = this.randomIndex(collections.length)
      const collection = collections[index]
      let createAssetDto = new CreateAssetDto()
      const tokenIndex = i + 1
      createAssetDto.price = price
      createAssetDto.userId = user.userId
      createAssetDto.index = tokenIndex
      createAssetDto.collectionId = collection.id
      const asset = this.assetRepository.create(createAssetDto)
      await this.assetRepository.save(asset)
      await this.collectionRepository.increment({ id: collection.id, }, "current", count);
      // 记录交易记录
      await this.assetRecordRepository.save({
        type: '2', // Buy
        assetId: asset.id,
        price: price,
        toId: user.userId,
        toName: user.nickName
      })

      // const pattern = { cmd: 'mintA' }
      // const mintDto = new MintADto()
      // mintDto.address = this.platformAddress
      // mintDto.tokenId = tokenIndex.toString()
      // mintDto.contractId = collection.contractId
      // mintDto.contractAddr = collection.contract.address
      // const result = await firstValueFrom(this.client.send(pattern, mintDto))
      // this.logger.debug(result)
    }
  }
  private randomIndex(max: number): number {
    return Math.floor(Math.random() * max);
  }
  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }

  /* 对某个collection进行index重新排序 */
  async arrangeAssetIndexOfCollection(collectionId: number, section: number) {
    let where: FindOptionsWhere<Asset> = {}
    let totalCount = 0;
    where =
    {
      collectionId,
      index: 0
    }
    // let totalCount: number = 0;
    const airdrops = await this.assetRepository.find({ where, take: section })
    if (airdrops.length === 0) return
    const result = await this.assetRepository.createQueryBuilder('asset')
      .select('max(`index`)', 'maxIndex')
      .where({ collectionId, index: Not(0) })
      .getRawOne()
    const baseIndex = result.maxIndex + 1
    this.logger.debug(baseIndex)

    await this.assetRepository.manager.transaction(async manager => {
      Promise.all(
        airdrops.map(async (asset, index) => {
          await manager.update(Asset, { id: asset.id }, { index: index + baseIndex }) // error
        }))
    })
  }


}
