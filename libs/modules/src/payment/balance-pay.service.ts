import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Inject, Injectable, Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { Activity } from '../activity/entities/activity.entity';
import { CreateAssetDto } from '../collection/dto/request-asset.dto';
import { Asset } from '../collection/entities/asset.entity';
import { Collection } from '../collection/entities/collection.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { MintADto } from '@app/chain';
import { Order } from '@app/modules/order/entities/order.entity';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { ACTIVITY_USER_ORDER_KEY } from '@app/common/contants/redis.contant';

@Injectable()
export class BalancePayService {
    platformAddress: string
    constructor(
        @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
        @InjectRepository(Activity) private readonly activityRepository: Repository<Activity>,
        @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
        @InjectRepository(Collection) private readonly collectionRepository: Repository<Collection>,
        @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
        @InjectRedis() private readonly redis: Redis,
        @Inject('CHAIN_SERVICE') private client: ClientProxy,
        private readonly configService: ConfigService,
    ) {
        this.platformAddress = this.configService.get<string>('crichain.platformAddress')
    }
    async payWithBalance(id: number, userId: number, userName: string) {
        // 在transaction里只做和冲突相关的，和冲突不相关的要放在外面
        // transaction里很有可能会失败，保证失败时是可以回退的，
        const order = await this.orderRepository.findOne({ where: { id: id, status: '1', userId: userId } })
        if (order == null) {
            throw new ApiException('订单状态错误')
        }
        let asset: Asset

        if (order.type === '1') {
            asset = await this.assetRepository.findOne({ where: { id: order.assetId }, relations: { user: true } })
            if (asset.userId === userId)
                throw new ApiException("不能购买自己的资产")
        }

        await this.orderRepository.manager.transaction(async manager => {
            const result = await manager.decrement(Account, { user: { userId: userId }, usable: MoreThanOrEqual(order.totalPrice) }, "usable", order.totalPrice);
            // this.logger.log(JSON.stringify(result));
            if (!result.affected) {
                throw new ApiException('支付失败')
            }
            order.status = '2';
            // 把Order的状态改成2: 已支付
            await manager.update(Order, { id: order.id }, { status: '2' })

            if (order.type === '1') {
                await manager.increment(Account, { userId: asset.user.userId }, "usable", order.totalPrice * 95 / 100)
                await manager.increment(Account, { userId: 1 }, "usable", order.totalPrice * 5 / 100)
                await manager.update(Asset, { id: order.assetId }, { userId: userId, status: '0' })
            }

        })

        if (order.type === '0') { // 一级市场活动
            // Create assetes for user.
            const activity = await this.activityRepository.findOne({ where: { id: order.activityId }, relations: ['collections'] })
            // First we need get all collections of orders, but we only get one collection.
            if (!activity.collections || activity.collections.length <= 0) {
                return order;
            }
            let collection: Collection;
            if (activity.type === '1') {
                // 首发盲盒, 我们需要随机寻找一个。
                const index = Math.floor((Math.random() * activity.collections.length));
                collection = activity.collections[index]
            } else {
                // 其他类型，我们只需要取第一个
                collection = activity.collections[0];
            }
            // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
            await this.collectionRepository.manager.transaction(async manager => {
                await manager.increment(Collection, { id: collection.id }, "current", order.count);
            })
            const unpayOrderKey = ACTIVITY_USER_ORDER_KEY + ":" + order.activityId + ":" + order.userId
            let tokenId: number
            for (let i = 0; i < order.count; i++) {
                tokenId = this.randomTokenId()
                let createAssetDto = new CreateAssetDto()
                createAssetDto.price = order.realPrice
                createAssetDto.assetNo = tokenId
                createAssetDto.userId = userId
                createAssetDto.collectionId = collection.id

                const asset = await this.assetRepository.save(createAssetDto)
                // 记录交易记录
                await this.assetRecordRepository.save({
                    type: '2', // Buy
                    assetId: asset.id,
                    price: order.realPrice,
                    toId: userId,
                    toName: userName
                })

                const pattern = { cmd: 'mintA' }
                const mintDto = new MintADto()
                mintDto.address = this.platformAddress
                mintDto.tokenId = tokenId.toString()
                mintDto.contractId = collection.contractId
                this.client.emit(pattern, mintDto)
                // this.logger.debug(await firstValueFrom(result))
            }
            await this.redis.del(unpayOrderKey)

        } else if (order.type === '1') { // 二级市场资产交易
            // 把资产切换到新的用户就可以了
            await this.buyAssetRecord(asset, userId, userName)
            // 还需要转移资产
        }
        // await manager.save(order);
        return order;
        // })
    }

    private randomTokenId(): number {
        return Math.floor((Math.random() * 999999999) + 1000000000);
    }

    async buyAssetRecord(asset: Asset, userId: number, userName: string) {

        const fromId = asset.user.userId
        const fromName = asset.user.userName

        await this.assetRecordRepository.save({
            type: '2', // Buy
            assetId: asset.id,
            price: asset.price,
            fromId: fromId,
            fromName: fromName,
            toId: userId,
            toName: userName
        })
    }
}