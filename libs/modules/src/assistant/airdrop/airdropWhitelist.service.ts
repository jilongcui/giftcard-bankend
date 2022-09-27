import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateAirdropWhitelistDto, ListAirdropWhitelistDto, UpdateAirdropWhitelistDto } from './dto/request-airdrop-whitelist.dto';
import { AirdropWhitelist } from './entities/airdrop-whitelist.entity';
import { ApiException } from '@app/common/exceptions/api.exception';
import { CollectionService } from '@app/modules/collection/collection.service';
import { UserService } from '@app/modules/system/user/user.service';
import { MintADto } from '@app/chain/dto/request-chain.dto';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Collection } from '@app/modules/collection/entities/collection.entity';
import { User } from '@app/modules/system/user/entities/user.entity';
import { CreateAssetDto } from '@app/modules/collection/dto/request-asset.dto';
import { AssetRecord } from '@app/modules/market/entities/asset-record.entity';
import { Asset } from '@app/modules/collection/entities/asset.entity';

@Injectable()
export class AirdropWhitelistService {
  logger = new Logger(AirdropWhitelistService.name)
  // platformAddress: string
  constructor(
    // @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
    // @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
    // @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
    private readonly collectionService: CollectionService,
    private readonly userService: UserService,
    // private readonly configService: ConfigService,
    // @Inject('CHAIN_SERVICE') private client: ClientProxy,
    @InjectRepository(AirdropWhitelist) private readonly airdropWhitelistRepository: Repository<AirdropWhitelist>
  ) {
    // this.platformAddress = this.configService.get<string>('crichain.platformAddress')
  }

  async create(createAirdropWhitelistDto: CreateAirdropWhitelistDto) {
    return await this.airdropWhitelistRepository.save(createAirdropWhitelistDto)
  }

  /* 分页查询 */
  async list(listAirdropWhitelistList: ListAirdropWhitelistDto, paginationDto: PaginationDto): Promise<PaginatedDto<AirdropWhitelist>> {
    let where: FindOptionsWhere<AirdropWhitelist> = {}
    let result: any;
    where = listAirdropWhitelistList;

    result = await this.airdropWhitelistRepository.findAndCount({
      // select: {
      //   user: {
      //     userId: true,
      //     nickName: true,
      //   },
      //   collection: {
      //     name: true,
      //   }
      // },
      where: where,
      relations: { user: true },
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  async findOne(id: number) {
    return await this.airdropWhitelistRepository.findOne({ where: { id }, relations: {} });
  }

  async update(id: number, updateAirdropWhitelistDto: UpdateAirdropWhitelistDto) {
    return await this.airdropWhitelistRepository.update(id, updateAirdropWhitelistDto)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.airdropWhitelistRepository.delete(noticeIdArr)
  }

  async remove(id: number) {
    return await this.airdropWhitelistRepository.delete(id)
  }

  /* 导入空投白名单 */
  async insert(data: any) {
    let whitelistArr: AirdropWhitelist[] = []
    for await (const iterator of data) {
      let whitelist = new AirdropWhitelist()
      if (!iterator.collectionIds || !iterator.userId) throw new ApiException('藏品ID和用户ID不能为空')
      const collections = await this.collectionService.findByIds(iterator.collectionIds.toString())
      if (!collections || collections.length === 0) throw new ApiException('藏品不存在')
      const user = await this.userService.findById(iterator.userId)
      if (!user) throw new ApiException('用户不存在')
      whitelist = Object.assign(whitelist, iterator)
      whitelistArr.push(whitelist)
    }
    await this.airdropWhitelistRepository.createQueryBuilder()
      .insert()
      .into(AirdropWhitelist)
      .values(whitelistArr)
      .execute()
  }

  /* 同步空投白名单记录 */
  async syncAirdropWhiteList() {
    let where: FindOptionsWhere<AirdropWhitelist> = {}
    let result: any;
    let totalCount = 0;
    where =
    {
      status: '0',
      updateTime: LessThanOrEqual(moment(moment.now()).subtract(2, 'minute').toDate())
    }
    // let totalCount: number = 0;
    const airdrops = await this.airdropWhitelistRepository.find({ where, take: 50 })
    // this.logger.debug(airdrops.length)
    if (airdrops.length === 0) return

    for (let i = 0; i < airdrops.length; i++) {
      const price = 0.0
      const airdrop = airdrops[i]
      const count = airdrop.count
      if (count > 500) {
        await this.airdropWhitelistRepository.manager.transaction(async manager => {
          let result = await manager.update(AirdropWhitelist, { id: airdrop.id, status: '0' }, { status: '3' }) // error
        })
        return
      }
      // const collection = await this.collectionService.findOne(airdrop.collectionId)
      // if (!collection) continue
      const user = await this.userService.findById(airdrop.userId)
      if (!user) continue
      await this.airdropWhitelistRepository.manager.transaction(async manager => {
        // 开始传输.
        let result = await manager.update(AirdropWhitelist, { id: airdrop.id, status: '0' }, { status: '1' })
        await this.collectionService.sendChainTransaction(airdrop.collectionIds.split(','), user, count, price)
        // 传输完成.
        result = await manager.update(AirdropWhitelist, { id: airdrop.id, status: '1' }, { status: '2' })
        totalCount = totalCount + count
        const logger = new Logger(AirdropWhitelistService.name)
      })
      this.logger.debug('totalCount', totalCount)
      if (totalCount >= 500) {
        return
      }

    }
    return totalCount;
  }

  // async sendChainTransaction(collection: Collection, user: User, count: number, price: number) {
  //   // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
  //   await this.collectionRepository.increment({ id: collection.id, }, "current", count);
  //   const tokenId = Math.floor((Math.random() * 999999999) + 1000000000);
  //   for (let i = 0; i < count; i++) {
  //     let createAssetDto = new CreateAssetDto()
  //     createAssetDto.price = price
  //     createAssetDto.assetNo = tokenId;
  //     createAssetDto.userId = user.userId
  //     createAssetDto.collectionId = collection.id

  //     const asset = await this.assetRepository.save(createAssetDto)
  //     // 记录交易记录
  //     await this.assetRecordRepository.save({
  //       type: '2', // Buy
  //       assetId: asset.id,
  //       price: price,
  //       toId: user.userId,
  //       toName: user.nickName
  //     })

  //     const pattern = { cmd: 'mintA' }
  //     const mintDto = new MintADto()
  //     mintDto.address = this.platformAddress
  //     mintDto.tokenId = tokenId.toString()
  //     mintDto.contractId = collection.contractId
  // mintDto.contractAddr = collection.contract.address
  //     await firstValueFrom(this.client.send(pattern, mintDto))
  //   }
  // }

}
