import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { privateDecrypt } from 'crypto';
import { Redis } from 'ioredis';
import { USER_CID_KEY } from '@app/common/contants/redis.contant';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { Repository } from 'typeorm';
import { Collection } from '../collection/entities/collection.entity';
import { User } from '../system/user/entities/user.entity';
import { Magicbox } from '../magicbox/entities/magicbox.entity';
import { MagicboxRecord } from '../magicbox/entities/magicbox-record.entity';

@Injectable()
export class MagicboxMarketService {
    constructor(
        @InjectRepository(Magicbox) private readonly magicboxRepository: Repository<Magicbox>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(MagicboxRecord) private readonly magicboxRecordRepository: Repository<MagicboxRecord>,
    ) { }

    async upMagicbox(id: number, price: number, userId: number, userName: string) {
        await this.magicboxRepository.update({ id: id, userId: userId, openStatus: '1', status: '0' }, { price: price, status: '1' })
        await this.magicboxRecordRepository.save({
            type: '1', // Sell
            magicboxId: id,
            price: price,
            fromId: userId,
            fromName: userName,
            toId: undefined,
            toName: undefined
        })
    }

    async buyMagicbox(id: number, userId: number, userName: string) {
        const asset = await this.magicboxRepository.findOne({ where: { id, openStatus: '1', status: '1' }, relations: ['user'] })
        const fromId = asset.user.userId
        const fromName = asset.user.userName
        if (fromId === userId)
            throw new ApiException("不能购买自己的资产")

        await this.magicboxRepository.update({ id: id, status: '0' }, { userId: userId })
        await this.magicboxRecordRepository.save({
            type: '2', // Buy
            magicboxId: id,
            price: asset.price,
            fromId: fromId,
            fromName: fromName,
            toId: userId,
            toName: userName
        })
    }

    async downMagicbox(id: number, userId: number, userName: string) {
        const asset = await this.magicboxRepository.update({ id: id, userId: userId, openStatus: '1', status: '1' }, { status: '0' })
        if (!asset) {
            throw new ApiException("无法操作此资产")
        }
        await this.magicboxRecordRepository.save({
            type: '3', // down
            magicboxId: id,
            price: undefined,
            fromId: undefined,
            fromName: undefined,
            toId: userId,
            toName: userName
        })
    }

    async transferMagicbox(id: number, userId: number, toUserName: string) {
        const asset = await this.magicboxRepository.findOne({ where: { id: id, userId: userId, openStatus: '1', status: '0' }, relations: ['user'] })
        if (!asset) {
            throw new ApiException("无权转赠此资产")
        }
        const toUser = await this.userRepository.findOneBy({ userName: toUserName })

        const fromId = asset.user.userId
        const fromName = asset.user.nickName
        const toUserId = toUser.userId
        if (fromId === toUserId)
            throw new ApiException("不能转赠给自己")
        await this.magicboxRepository.update(id, { userId: toUserId })
        await this.magicboxRecordRepository.save({
            type: '4', // 转增
            magicboxId: id,
            price: asset.price,
            fromId: fromId,
            fromName: fromName,
            toId: toUserId,
            toName: toUser.nickName
        })
    }

    async transferMagicboxs(ids: number[] | string[], userId: number, toUserName: string) {
        return Promise.all(ids.map(async (id: number | string) => {
            try {
                await this.transferMagicbox(+id, userId, toUserName)
            } catch (error: any) {
                return error.message
            }
        }))
    }
}
