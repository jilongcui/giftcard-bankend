import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateBannerDto, ListBannerDto, UpdateBannerDto } from './dto/request-banner.dto';
import { Banner } from './entities/banner.entity';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner) private readonly bannerRepository: Repository<Banner>,
  ) { }

  create(createBannerDto: CreateBannerDto) {
    return this.bannerRepository.save(createBannerDto)
  }

  /* 分页查询 */
  async list(listBannerDto: ListBannerDto, paginationDto: PaginationDto): Promise<PaginatedDto<Banner>> {
    let where: FindOptionsWhere<Banner> = {}
    let result: any;
    where = listBannerDto;
    result = await this.bannerRepository.findAndCount({
      where,
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        orderNum: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.bannerRepository.findOneBy({ id })
  }

  update(id: number, updateBannerDto: UpdateBannerDto) {
    return this.bannerRepository.update(id, updateBannerDto)
  }

  remove(id: number) {
    return this.bannerRepository.delete(id)
  }
}
