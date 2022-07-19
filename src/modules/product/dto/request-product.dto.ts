import { OmitType, PartialType } from "@nestjs/swagger";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Product } from "../entities/product.entity";


export class CreateProductDto extends OmitType(Product, ['prodId'] as const) { }
export class UpdateProductDto extends PartialType(CreateProductDto) { }
export class ListProductDto extends PartialType(OmitType(Product, ['images'] as const)) { }
