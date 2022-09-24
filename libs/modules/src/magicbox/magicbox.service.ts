import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { ApiException } from '@app/common/exceptions/api.exception';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { CreateMagicboxDto, UpdateMagicboxDto, ListMagicboxDto, FlowMagicboxDto } from './dto/request-magicbox.dto';
import { Magicbox } from './entities/magicbox.entity';

@Injectable()
export class MagicboxService {
    logger = new Logger(MagicboxService.name)
    constructor(
        @InjectRepository(Magicbox) private readonly magicboxRepository: Repository<Magicbox>,
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
            // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
            // select: ['magicboxId', "user", "collection"],
            relations: ["user", "collection"],
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

    /* 分页查询 */
    async myList(userId: number, listMagicboxList: ListMagicboxDto, paginationDto: PaginationDto): Promise<PaginatedDto<Magicbox>> {
        let where: FindOptionsWhere<Magicbox> = {}
        let result: any;

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
                collection: {
                    author: {
                        nickName: true,
                        avatar: true,
                    },
                    name: true,
                    desc: true,
                    supply: true,
                    images: true,
                    contract: {
                        chain: true,
                        standard: true,
                        address: true,
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

    update(id: number, updateMagicboxDto: UpdateMagicboxDto) {
        return `This action updates a #${id} magicbox`;
    }

    remove(id: number) {
        return `This action removes a #${id} magicbox`;
    }
    async delete(idArr: number[] | string[]) {
        return this.magicboxRepository.delete(idArr)
    }
}
