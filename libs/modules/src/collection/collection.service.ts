import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { CreateCollectionDto, UpdateCollectionDto, ListCollectionDto } from './dto/request-collection.dto';
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

  findOne(id: number) {
    return this.collectionRepository.findOne({ where: { id: id }, relations: ['author', 'contract'], })
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

  async sendChainTransaction(collection: Collection, user: User, count: number, price: number) {
    // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
    await this.collectionRepository.increment({ id: collection.id, }, "current", count);
    let tokenId: number
    for (let i = 0; i < count; i++) {
      tokenId = this.randomTokenId()
      let createAssetDto = new CreateAssetDto()
      createAssetDto.price = price
      createAssetDto.assetNo = tokenId
      createAssetDto.userId = user.userId
      createAssetDto.collectionId = collection.id

      const asset = await this.assetRepository.save(createAssetDto)
      // 记录交易记录
      await this.assetRecordRepository.save({
        type: '2', // Buy
        assetId: asset.id,
        price: price,
        toId: user.userId,
        toName: user.nickName
      })

      const pattern = { cmd: 'mintA' }
      const mintDto = new MintADto()
      mintDto.address = this.platformAddress
      mintDto.tokenId = tokenId.toString()
      mintDto.contractId = collection.contractId
      mintDto.contractAddr = collection.contract.address
      const result = await firstValueFrom(this.client.emit(pattern, mintDto))
      this.logger.debug(result)
    }
  }

  private randomTokenId(): number {
    return Math.floor((Math.random() * 999999999) + 1000000000);
  }
}
