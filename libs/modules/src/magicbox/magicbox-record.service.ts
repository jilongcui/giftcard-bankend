import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateMagicboxRecordDto } from './dto/request-magicbox-record.dto';
import { MagicboxRecord } from './entities/magicbox-record.entity';

@Injectable()
export class MagicboxRecordService {
    constructor(
        @InjectRepository(MagicboxRecord) private readonly magicboxRecordRepository: Repository<MagicboxRecord>,
    ) { }
    create(createMagicboxRecordDto: CreateMagicboxRecordDto) {
        return 'This action adds a new market';
    }

    async list(id: number, paginationDto: PaginationDto): Promise<PaginatedDto<MagicboxRecord>> {
        let where: FindOptionsWhere<MagicboxRecord> = {}
        let result: any;
        where = { magicboxId: id };
        result = await this.magicboxRecordRepository.findAndCount({
            // select: ['id', 'coverImage', 'startTime', 'status', 'endTime', 'title', 'type', 'collections',],
            where,
            // relations: ['collections', 'collections.author'],
            skip: paginationDto.skip,
            take: paginationDto.take,
            order: {
                id: 'DESC'
            }
        })
        return {
            rows: result[0],
            total: result[1]
        }
    }

    remove(id: number) {
        return `This action removes a #${id} market`;
    }
}
