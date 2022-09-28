import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { FindOptionsWhere, Like, Not, Repository, TreeRepository } from 'typeorm';
import { CreateMagicboxDto, UpdateMagicboxDto, ListMagicboxDto, FlowMagicboxDto, ListMyMagicboxDto } from './dto/request-magicbox.dto';
import { Magicbox } from './entities/magicbox.entity';
import { Asset } from '../collection/entities/asset.entity';
import { AssetRecord } from '../market/entities/asset-record.entity';
import { ResListMyMagicboxDto } from './dto/response-magicbox.dto';

@Injectable()
export class MagicboxService {
    logger = new Logger(MagicboxService.name)
    constructor(
        @InjectRepository(Magicbox) private readonly magicboxRepository: Repository<Magicbox>,
        @InjectRepository(AssetRecord) private readonly assetRecordRepository: Repository<AssetRecord>,
    ) { }
    create(createMagicboxDto: CreateMagicboxDto) {
        return this.magicboxRepository.create(createMagicboxDto);
    }

    /* 新增或编辑 */
    async addOrUpdate(magicbox: Magicbox) {
        return await this.magicboxRepository.save(magicbox)
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
                openStatus: true,
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

    /* 我的藏品查询 */
    async myCollectionList(userId: number, listMyMagicboxDto: ListMyMagicboxDto, paginationDto: PaginationDto): Promise<PaginatedDto<ResListMyMagicboxDto>> {
        let where: FindOptionsWhere<Magicbox> = {}
        let result: any;
        where = {
            ...listMyMagicboxDto,
            userId: userId,
        }
        // if (listMyMagicboxDto.status === '1')
        //   where.invalidTime = MoreThanOrEqual(moment(moment.now()).toDate())

        const myQueryBuilder = await this.magicboxRepository.createQueryBuilder('magicbox')
            .select('count(*)', 'mycount')
            .addSelect('activity.id', 'id')
            .addSelect('activity.title', 'name')
            .addSelect('activity.supply', 'supply')
            .addSelect('activity.current', 'current')
            .addSelect('activity.status', 'status')
            .addSelect('activity.cover_image', 'image')
            .leftJoin('magicbox.activity', 'activity')
            .where(where)
            .orderBy('activity.create_time', 'DESC')
            .groupBy('magicbox.activity_id')
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
    async listOfCollection(collectionId: number, paginationDto: PaginationDto): Promise<PaginatedDto<Magicbox>> {
        let where: FindOptionsWhere<Magicbox> = {}
        let result: any;

        where.activityId = collectionId
        result = await this.magicboxRepository.findAndCount({
            select: {
                id: true,
                boxNo: true,
                index: true,
                price: true,
                openStatus: true,
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

    /* collection下的magic分页查询 */
    async myListOfCollection(activityId: number, userId: number, paginationDto: PaginationDto): Promise<PaginatedDto<Magicbox>> {
        let where: FindOptionsWhere<Magicbox> = {}
        let result: any;

        where.activityId = activityId
        where.userId = userId
        result = await this.magicboxRepository.findAndCount({
            select: {
                id: true,
                price: true,
                boxNo: true,
                index: true,
                openStatus: true,
                status: true,
                userId: true,
                createTime: true,
                collection: {
                    id: true,
                    name: true,
                    level: true,
                    desc: true
                },
                assetId: true
            },
            where,
            relations: {
                collection: true
            },
            skip: paginationDto.skip,
            take: paginationDto.take || 20,
            order: {
                createTime: 'DESC',
            }
        })

        const magicboxes: any[] = result[0]

        magicboxes.map((magicbox: Magicbox) => {
            if (magicbox.openStatus !== '2') {
                magicbox.assetId = undefined
                magicbox.collection = undefined
            }
        })

        return {
            rows: magicboxes,
            total: result[1]
        }
    }

    /* 我未开启盲盒的查询，只能通过activity来查询*/
    async myUnopenedList(userId: number, listMagicboxList: ListMagicboxDto, paginationDto: PaginationDto): Promise<PaginatedDto<Magicbox>> {
        let where: FindOptionsWhere<Magicbox> = {}
        let result: any;

        listMagicboxList.openStatus = listMagicboxList.openStatus || '1' // 已购买
        where = {
            ...listMagicboxList,
            userId: userId,
            activity: {
                title: paginationDto.keywords ? Like(`%${paginationDto.keywords}%`) : undefined
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
                openStatus: true,
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

    /* 我已经开启盲盒的查询 */
    async myOpenedList(userId: number, listMagicboxList: ListMagicboxDto, paginationDto: PaginationDto): Promise<PaginatedDto<Magicbox>> {
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
                openStatus: true,
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
                openStatus: true,
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
                openStatus: true,
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

    async findOne(id: number) {
        const magicbox = await this.magicboxRepository.findOne({
            select: {
                id: true,
                price: true,
                userId: true,
                openStatus: true,
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
                activity: {
                    collections: true
                },
                collection: {
                    author: false,
                    contract: true,
                }
            }
        })

        if (magicbox.openStatus !== '2') {
            magicbox.assetId = undefined
            magicbox.collection = undefined
        }
        return magicbox
    }

    async findMyOne(id: number, userId: number) {
        const magicbox = await this.magicboxRepository.findOne({
            select: {
                id: true,
                price: true,
                userId: true,
                status: true,
                assetId: true,
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
                activity: {
                    collections: true
                },
                asset: true,
                collection: {
                    author: false,
                    contract: true,
                }
            }
        })
        if (magicbox.openStatus !== '2') {
            magicbox.assetId = undefined
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
                openStatus: true,
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
            where: { id: id, userId: userId, openStatus: '1' }, relations: { user: true, collection: true, asset: true }
        })
        if (!magicbox) throw new ApiException("未找到盲盒")
        // 打开这个盲盒
        await this.magicboxRepository.manager.transaction(async manager => {
            await manager.update(Magicbox, { id, userId }, { openStatus: '2' }) // 打开盲盒
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
        magicbox.openStatus = '2'
        return magicbox
    }

    /* 对某个collection进行index重新排序 */
    async arrangeMagicboxIndexOfCollection(collectionId: number, section: number) {
        let where: FindOptionsWhere<Magicbox> = {}
        let totalCount = 0;
        where =
        {
            activityId: collectionId,
            index: 0
        }
        // let totalCount: number = 0;
        const airdrops = await this.magicboxRepository.find({ where, take: section })
        if (airdrops.length === 0) return
        const result = await this.magicboxRepository.createQueryBuilder('asset')
            .select('max(`index`)', 'maxIndex')
            .where({ collectionId, index: Not(0) })
            .getRawOne()
        const baseIndex = result.maxIndex + 1
        this.logger.debug(baseIndex)

        await this.magicboxRepository.manager.transaction(async manager => {
            Promise.all(
                airdrops.map(async (asset, index) => {
                    await manager.update(Magicbox, { id: asset.id }, { index: index + baseIndex }) // error
                }))
        })
    }

    /* 对某个collection进行boxNo重新生成 */
    async arrangeMagicboxNoOfCollection(collectionId: number, section: number) {
        let where: FindOptionsWhere<Magicbox> = {}
        let totalCount = 0;
        where =
        {
            activityId: collectionId,
            boxNo: 0
        }
        // let totalCount: number = 0;
        const airdrops = await this.magicboxRepository.find({ where, take: section })
        if (airdrops.length === 0) return

        await this.magicboxRepository.manager.transaction(async manager => {
            Promise.all(
                airdrops.map(async (magicbox) => {
                    await manager.update(Magicbox, { id: magicbox.id }, { boxNo: this.randomTokenId() }) // error
                }))
        })
    }

    private randomTokenId(): number {
        return Math.floor((Math.random() * 999999999) + 1000000000);
    }
}
