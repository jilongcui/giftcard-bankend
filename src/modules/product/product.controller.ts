import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Logger, Put } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, ListProductDto, UpdateProductDto } from './dto/request-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationPipe } from 'src/common/pipes/pagination.pipe';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { DataObj } from 'src/common/class/data-obj.class';
import { Public } from 'src/common/decorators/public.decorator';
import { Product } from './entities/product.entity';
import { ApiPaginatedResponse } from 'src/common/decorators/api-paginated-response.decorator';
import { RequiresPermissions } from 'src/common/decorators/requires-permissions.decorator';
import { Log, BusinessTypeEnum } from 'src/common/decorators/log.decorator';
import { RepeatSubmit } from 'src/common/decorators/repeat-submit.decorator';
import { User as UserDec, UserEnum } from 'src/common/decorators/user.decorator';
import { UserInfoPipe } from 'src/common/pipes/user-info.pipe';

@ApiTags('产品')
@Controller('product')
@ApiBearerAuth()
export class ProductController {
  logger = new Logger(ProductController.name);
  constructor(private readonly productService: ProductService) { }

  /* 新增产品 */
  @Post()
  @Log({
    title: '产品',
    businessType: BusinessTypeEnum.insert
  })
  async create(@Body() createProductDto: CreateProductDto, @UserDec(UserEnum.userId) userId: number) {
    return DataObj.create(this.productService.create(createProductDto));
  }

  /* 产品列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Product)
  async list(@Query() listProductDto: ListProductDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    // this.logger.log(JSON.stringify(paginationDto));
    return DataObj.create(await this.productService.list(listProductDto, paginationDto));
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return DataObj.create(await this.productService.findOne(+id));
  }

  /* 更新产品 */
  @RepeatSubmit()
  @Put()
  @Log({
    title: '产品',
    businessType: BusinessTypeEnum.update
  })
  async update(@Body() product: Product, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
    product.updateBy = userName
    await this.productService.addOrUpdate(product)
  }

  /* 删除产品 */
  @Delete(':prodIds')
  @RequiresPermissions('system:product:remove')
  @Log({
    title: '产品',
    businessType: BusinessTypeEnum.delete
  })
  async delete(@Param('prodIds') prodIds: string) {
    await this.productService.delete(prodIds.split(','))
  }
}
