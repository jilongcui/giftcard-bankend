import { Inject, Injectable, Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateSubmitterDto, ListMySubmitterDto, ListSubmitterDto, UpdateSubmitterDto } from './dto/request-submitter.dto';
import { Submitter } from './entities/submitter.entity';

@Injectable()
export class SubmitterService {
    logger = new Logger(SubmitterService.name)
    constructor(
        @InjectRepository(Submitter) private readonly submitterRepository: Repository<Submitter>,

    ) {
    }

    async create(createSubmitterDto: CreateSubmitterDto) {
        const submitter = {
            ...createSubmitterDto,
        }
        return this.submitterRepository.save(submitter)
    }

    /* 新增或编辑 */
    async addOrUpdateAll(createSubmitterDto: CreateSubmitterDto) {
        return await this.submitterRepository.save(createSubmitterDto)
    }

    /* 分页查询 */
    async list(listSubmitterList: ListSubmitterDto, paginationDto: PaginationDto): Promise<PaginatedDto<Submitter>> {
        let where: FindOptionsWhere<Submitter> = {}
        let result: any;
        where = listSubmitterList

        result = await this.submitterRepository.findAndCount({
            where,
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

    findOne(id: number) {
        return this.submitterRepository.findOne({ where: { id: id }, relations: {} })
    }

    async update(id: number, updateSubmitterDto: UpdateSubmitterDto) {
        return this.submitterRepository.update(id, updateSubmitterDto)
    }

    deleteOne(id: number) {
        return this.submitterRepository.delete(id)
    }

    async delete(noticeIdArr: number[] | string[]) {
        return this.submitterRepository.delete(noticeIdArr)
    }

    async setRead(id: number) {
        let updateSubmitterDto: UpdateSubmitterDto = {
            status: '1'
        }
        return this.submitterRepository.update(id, updateSubmitterDto)
    }
}

