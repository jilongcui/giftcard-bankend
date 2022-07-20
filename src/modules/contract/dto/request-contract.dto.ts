import { OmitType, PartialType } from "@nestjs/swagger";
import { Contract } from "../entities/contract.entity";

export class CreateContractDto extends OmitType(Contract, ['id'] as const) { }
export class UpdateAllContractDto extends Contract { }
export class UpdateContractDto extends PartialType(CreateContractDto) { }
export class ListContractDto extends PartialType(Contract) { }
