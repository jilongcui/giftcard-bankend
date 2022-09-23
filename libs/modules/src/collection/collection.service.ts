import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
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

  /* 我的藏品查询 */
  async mylist(userId: number, listMyCollectionDto: ListMyCollectionDto, paginationDto: PaginationDto): Promise<PaginatedDto<Collection>> {
    let where: FindOptionsWhere<Collection> = {}
    let result: any;
    where = {
      ...listMyCollectionDto,
    }
    // if (listMyCollectionDto.status === '1')
    //   where.invalidTime = MoreThanOrEqual(moment(moment.now()).toDate())

    const myQueryBuilder = await this.assetRepository.createQueryBuilder('asset')
      .select('count(*)', 'inviteCount')
      .addSelect('parent.id', 'userId')
      .addSelect('parent.user_name', 'userName')
      .leftJoin('asset.collection', 'collection')
      .where(where)
      .orderBy('inviteCount', 'DESC')
      .groupBy('asset.collection_id')
    // .limit(params.count)
    this.logger.debug(myQueryBuilder.getQuery())

    let resultArr = await myQueryBuilder.getRawMany()
    resultArr = resultArr.map((item, index) => { item.rank = index + 1; if (item.inviteCount >= 1) return item }).filter(l => l != undefined)
    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.collectionRepository.findOne({ where: { id: id }, relations: ['author', 'contract'], })
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

  async sendChainTransaction(collectionIds: string[], user: User, count: number, price: number) {
    // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
    const collections = await this.collectionRepository.findBy({ id: In(collectionIds) })
    let tokenId: number
    for (let i = 0; i < count; i++) {
      tokenId = this.randomTokenId()
      const collection = collections[i % collections.length]
      let createAssetDto = new CreateAssetDto()
      createAssetDto.price = price
      createAssetDto.assetNo = tokenId
      createAssetDto.userId = user.userId
      createAssetDto.collectionId = collection.id
      const asset = await this.assetRepository.save(createAssetDto)
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
      // mintDto.tokenId = tokenId.toString()
      // mintDto.contractId = collection.contractId
      // mintDto.contractAddr = collection.contract.address
      // const result = await firstValueFrom(this.client.send(pattern, mintDto))
      // this.logger.debug(result)
    }
  }

  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }
}
