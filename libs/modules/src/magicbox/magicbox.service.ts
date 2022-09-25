import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { FindOptionsWhere, Like, Repository, TreeRepository } from 'typeorm';
import { CreateMagicboxDto, UpdateMagicboxDto, ListMagicboxDto, FlowMagicboxDto } from './dto/request-magicbox.dto';
import { Magicbox } from './entities/magicbox.entity';
import { Asset } from '../collection/entities/asset.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';

@Injectable()
export class MagicboxService {
    logger = new Logger(MagicboxService.name)
    constructor(
        @InjectRepository(Magicbox) private readonly magicboxRepository: Repository<Magicbox>,
        @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
        @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
    ) { }
    create(createMagicboxDto: CreateMagicboxDto) {
        return this.magicboxRepository.save(createMagicboxDto);
    }

    /* 新增或编辑 */
    async addOrUpdate(createMagicboxDto: CreateMagicboxDto) {
        return await this.magicboxRepository.save(createMagicboxDto)
    }

    /* 分页查询 */
    async list(listMagicboxDto: ListMagicboxDto, paginationDto: PaginationDto): Promise<PaginatedDto<Magicbox>> {
        let where: FindOptionsWhere<Magicbox> = {}
        let result: any;
        const orderBy = paginationDto.isAsc === 'true' ? 'ASC' : 'DESC'
        where = {
            ...listMagicboxDto,
        };

        result = await this.magicboxRepository.findAndCount({
            select: {
                id: true,
                price: true,
                updateTime: true,
                createTime: true,
                userId: true,
                status: true,
                user: {
                    nickName: true,
                    avatar: true,
                },
                activity: {
                    id: true,
                    title: true,
                    coverImage: true,
                    authorName: true,
                    avatar: true,
                    collections: true
                },
            },
            relations: ["user", "activity"],
            where: listMagicboxDto,
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

    /* 我已经购买的查询 */
    async myList(userId: number, listMagicboxList: ListMagicboxDto, paginationDto: PaginationDto): Promise<PaginatedDto<Magicbox>> {
        let where: FindOptionsWhere<Magicbox> = {}
        let result: any;

        listMagicboxList.openStatus = listMagicboxList.openStatus || '1' // 已购买
        where = {
            ...listMagicboxList,
            userId: userId,
            collection: {
                name: paginationDto.keywords ? Like(`%${paginationDto.keywords}%`) : undefined
            }
        }

        const orderBy = paginationDto.isAsc === 'true' ? 'ASC' : 'DESC'
        result = await this.magicboxRepository.findAndCount({
            where,
            select: {
                id: true,
                price: true,
                updateTime: true,
                createTime: true,
                userId: true,
                status: true,
                user: {
                    nickName: true,
                    avatar: true,
                },
                activity: {
                    id: true,
                    title: true,
                    coverImage: true,
                    authorName: true,
                    avatar: true,
                    collections: true
                },
                collection: listMagicboxList.openStatus === '2' ? {
                    name: true,
                    desc: true,
                    type: true,
                    level: true,
                    supply: true,
                    current: true,
                    images: true,
                    author: {
                        nickName: true,
                        avatar: true,
                    },
                } : {},

            },
            relations: {
                user: true,
                activity: true,
                collection: listMagicboxList.openStatus === '2' ? true : false
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
    async flow(flowMagicboxDto: FlowMagicboxDto, paginationDto: PaginationDto): Promise<PaginatedDto<Magicbox>> {
        let where: FindOptionsWhere<Magicbox> = {}
        let result: any;
        const orderBy = paginationDto.isAsc === 'true' ? 'ASC' : 'DESC'
        where = {
            ...flowMagicboxDto,
            status: '1',
            collection: {
                name: paginationDto.keywords ? Like(`%${paginationDto.keywords}%`) : undefined
            }
        }

        result = await this.magicboxRepository.findAndCount({
            select: {
                id: true,
                price: true,
                updateTime: true,
                createTime: true,
                userId: true,
                status: true,
                user: {
                    nickName: true,
                    avatar: true,
                },
                activity: {
                    id: true,
                    title: true,
                    coverImage: true,
                    authorName: true,
                    avatar: true,
                    collections: true
                },
            },
            where,
            relations: {
                user: true,
                activity: true
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

    async latest(): Promise<PaginatedDto<Magicbox>> {
        let where: FindOptionsWhere<Magicbox> = {
            status: '1' // market
        }
        let result: any;

        result = await this.magicboxRepository.findAndCount({
            select: {
                id: true,
                price: true,
                updateTime: true,
                userId: true,
                status: true,
                user: {
                    nickName: true,
                    avatar: true,
                },
                activity: {
                    id: true,
                    title: true,
                    coverImage: true,
                    authorName: true,
                    avatar: true,
                    collections: true
                },
            },
            relations: {
                user: true,
                activity: true,
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
        return this.magicboxRepository.findOne({
            select: {
                id: true,
                price: true,
                userId: true,
                status: true,
                user: {
                    nickName: true,
                    avatar: true,
                },
                activity: {
                    id: true,
                    title: true,
                    coverImage: true,
                    authorName: true,
                    avatar: true,
                    collections: true
                },
            },
            where: { id },
            relations: {
                user: true,
                activity: true,
                collection: {
                    author: false,
                    contract: true,
                }
            }
        })
    }

    async findMyOne(id: number, userId: number) {
        const magicbox = await this.magicboxRepository.findOne({
            select: {
                id: true,
                price: true,
                userId: true,
                status: true,
                user: {
                    nickName: true,
                    avatar: true,
                },
                collection: {
                    name: true,
                    desc: true,
                    type: true,
                    level: true,
                    supply: true,
                    current: true,
                    images: true,
                    author: {
                        nickName: true,
                        avatar: true,
                    },
                },
                activity: {
                    id: true,
                    title: true,
                    coverImage: true,
                    authorName: true,
                    avatar: true,
                    collections: true
                },
                asset: {
                    id: true,
                    assetNo: true,
                    index: true,
                    price: true
                }
            },
            where: { id, userId },
            relations: {
                user: true,
                activity: true,
                asset: true,
                collection: {
                    author: false,
                    contract: true,
                }
            }
        })
        if (magicbox.status !== '2') {
            magicbox.asset = undefined
            magicbox.collection = undefined
        }
        return magicbox
    }

    update(id: number, updateMagicboxDto: UpdateMagicboxDto) {
        return `This action updates a #${id} magicbox`;
    }

    remove(id: number) {
        return `This action removes a #${id} magicbox`;
    }
    async delete(idArr: number[] | string[]) {
        return this.magicboxRepository.delete(idArr)
    }

    async open(id: number, userId: number) {
        const magicbox = await this.magicboxRepository.findOne({
            select: {
                id: true,
                price: true,
                userId: true,
                assetId: true,
                status: true,
                user: {
                    nickName: true,
                    avatar: true,
                },
                collection: {
                    id: true,
                    name: true,
                    desc: true,
                    type: true,
                    level: true,
                    supply: true,
                    current: true,
                    images: true,
                    author: {
                        nickName: true,
                        avatar: true,
                    },
                },
                asset: {
                    id: true,
                    assetNo: true,
                    index: true,
                    price: true
                }
            },
            where: { id: id, userId: userId, status: '1' }, relations: { user: true, collection: true, asset: true }
        })
        if (!magicbox) throw new ApiException("未找到盲盒")
        // 打开这个盲盒
        await this.magicboxRepository.manager.transaction(async manager => {
            await manager.update(Magicbox, { id, userId }, { status: '2' }) // 打开盲盒
            await manager.update(Asset, { id: magicbox.assetId, userId: 1 }, { userId })
            // 构建交易记录
            await manager.save(AssetRecord, {
                type: '5', // Open Magic Box
                assetId: magicbox.assetId,
                price: magicbox.price,
                toId: userId,
                toName: magicbox.user.nickName
            })
        })

        return magicbox
    }
}
