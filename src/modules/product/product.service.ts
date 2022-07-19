import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from 'src/common/dto/paginated.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { FindConditions, Like, Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto, ListProductDto } from './dto/request-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
  ) { }
  create(createProductDto: CreateProductDto) {
    return this.productRepository.save(createProductDto);
  }

  /* 新增或编辑 */
  async addOrUpdate(createProductDto: CreateProductDto) {
    return await this.productRepository.save(createProductDto)
}

  /* 分页查询 */
  async list(listProdList: ListProductDto, paginationDto: PaginationDto): Promise<PaginatedDto<Product>> {
    let where: FindConditions<Product> = {}
    let result: any;
    if (listProdList.prodName) {
      where.prodName = Like(`%${listProdList.prodName}%`)
    }
    if (listProdList.prodId) {
      where.prodId = listProdList.prodId
    }
    result = await this.productRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
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
    return this.productRepository.findOne(id)
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
  async delete(noticeIdArr: number[] | string[]) {
    return this.productRepository.delete(noticeIdArr)
  }
}
